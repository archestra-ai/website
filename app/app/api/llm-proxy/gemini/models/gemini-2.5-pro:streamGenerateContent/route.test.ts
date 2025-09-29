import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@lib/db/auth';
import { drizzleClientHttp } from '@lib/db/db';

import { POST } from './route';

// Mock external dependencies
vi.mock('@lib/db/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@lib/db/db', () => ({
  drizzleClientHttp: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@google/generative-ai', () => {
  const mockGenerativeModel = {
    generateContentStream: vi.fn(),
  };

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue(mockGenerativeModel),
    })),
  };
});

// Mock constants
vi.mock('@constants', () => ({
  default: {
    inference: {
      geminiApiKey: 'test-api-key',
      rateLimits: {
        dailyTokenLimit: 3_000_000,
        dailyTotalTokenUsageLimit: 5_000_000,
      },
    },
  },
}));

type MockSessionReturnType = Awaited<ReturnType<typeof auth.api.getSession>>;

describe('Rate Limiting Tests', () => {
  const mockUserId = 'test-user-123';
  const mockToday = new Date().toISOString().split('T')[0];
  const mockSession = {
    session: {
      id: 'session-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: mockUserId,
      expiresAt: new Date(Date.now() + 86400000),
      token: 'test-token',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    },
    user: {
      id: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      image: null,
    },
  } as MockSessionReturnType;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('checkAndUpdateTokenUsage function behavior', () => {
    it('should allow first request of the day and create a new record', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - no existing record
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Mock insert for new record
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(drizzleClientHttp.insert).mockImplementation(mockInsert);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Verify token usage check was called (select)
      expect(mockSelect).toHaveBeenCalled();

      // Verify new record was NOT created during initial check
      // It should only be created after token usage is known
      const insertCalls = vi.mocked(drizzleClientHttp.insert).mock.calls;
      expect(insertCalls.length).toBeLessThanOrEqual(1);
    });

    it('should reject request when user exceeds daily token limit', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - user at limit
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: `${mockUserId}_${mockToday}`,
                userId: mockUserId,
                date: mockToday,
                tokensUsed: 3_000_000, // At daily limit
                requestCount: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.details.dailyTokenLimit).toBe(3_000_000);
      expect(body.details.tokensUsed).toBe(3_000_000);
      expect(body.details).not.toHaveProperty('maxRequestsPerDay');
    });

    it('should allow request when user is under the daily token limit', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - user under limit
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: `${mockUserId}_${mockToday}`,
                userId: mockUserId,
                date: mockToday,
                tokensUsed: 1_500_000, // Half of daily limit
                requestCount: 50,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Mock update
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(drizzleClientHttp.update).mockImplementation(mockUpdate);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should correctly update token usage after successful API call', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - existing record with some usage
      const mockSelect = vi.fn();
      mockSelect
        .mockReturnValueOnce({
          // First call - check global total
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 5_000_000, // Well under global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Second call - check user's usage before request
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${mockUserId}_${mockToday}`,
                  userId: mockUserId,
                  date: mockToday,
                  tokensUsed: 1000,
                  requestCount: 5,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Third call - check global total after token usage
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 5_000_000, // Still under global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Fourth call - check user's usage after token usage
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${mockUserId}_${mockToday}`,
                  userId: mockUserId,
                  date: mockToday,
                  tokensUsed: 1000,
                  requestCount: 5,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Mock update
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(drizzleClientHttp.update).mockImplementation(mockUpdate);

      // Mock successful Gemini API response with specific token counts
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test response' }, finishReason: 'STOP', index: 0 }],
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test response' }, finishReason: 'STOP' }],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150, // This should be added to existing 1000
          },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Read the entire stream to trigger the token usage update
      const reader = response.body?.getReader();
      if (reader) {
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) {
            const text = new TextDecoder().decode(result.value);
            // Check if we've reached the end of the stream
            if (text.includes('[DONE]')) {
              break;
            }
          }
        }
      }

      // Give a small delay for the database update to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify update was called with correct token count
      expect(mockUpdate).toHaveBeenCalled();

      // Verify the update was called with the correct parameters
      const setCall = mockUpdate.mock.results[0]?.value?.set?.mock?.calls[0];
      if (setCall && setCall[0]) {
        expect(setCall[0].tokensUsed).toBe(1150); // 1000 existing + 150 new
      }
    });

    it('should handle different users with separate rate limits', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      // First user at limit
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId1,
          expiresAt: new Date(Date.now() + 86400000),
          token: 'test-token-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
        user: {
          id: userId1,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user1@example.com',
          emailVerified: true,
          name: 'User 1',
          image: null,
        },
      } as MockSessionReturnType);

      // First user's mock selects (global check, then user check)
      const mockSelect1 = vi.fn();
      mockSelect1
        .mockReturnValueOnce({
          // Check global total - under limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 10_000_000, // Under global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Check user 1's usage - at personal limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${userId1}_${mockToday}`,
                  userId: userId1,
                  date: mockToday,
                  tokensUsed: 3_000_000,
                  requestCount: 100,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect1);

      // First request - should be rejected
      const request1 = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(429);

      // Second user under limit
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: {
          id: 'session-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId2,
          expiresAt: new Date(Date.now() + 86400000),
          token: 'test-token-2',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
        user: {
          id: userId2,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user2@example.com',
          emailVerified: true,
          name: 'User 2',
          image: null,
        },
      } as MockSessionReturnType);

      // Second user's mock selects (global check, then user check)
      const mockSelect2 = vi.fn();
      mockSelect2
        .mockReturnValueOnce({
          // Check global total - still under limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 10_000_100, // Still under global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Check user 2's usage - well under limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${userId2}_${mockToday}`,
                  userId: userId2,
                  date: mockToday,
                  tokensUsed: 100,
                  requestCount: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect2);

      // Mock update for second user
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(drizzleClientHttp.update).mockImplementation(mockUpdate);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Second request - should be allowed
      const request2 = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(200);
    });

    it('should reject request when global daily token limit is exceeded', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - global limit exceeded (sum of all users)
      const mockSelect = vi.fn();
      mockSelect
        .mockReturnValueOnce({
          // First call - check global total
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 5_000_001, // Just over global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Second call - check user's usage
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${mockUserId}_${mockToday}`,
                  userId: mockUserId,
                  date: mockToday,
                  tokensUsed: 100, // User is well under their limit
                  requestCount: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error).toBe('Global daily token limit exceeded');
      expect(body.details.dailyTotalTokenUsageLimit).toBe(5_000_000);
      expect(body.details.totalTokensUsedToday).toBe(5_000_001);
      expect(body.details.message).toContain('total token usage across all users');
    });

    it('should track total usage across multiple users', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      // First user makes a request
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId1,
          expiresAt: new Date(Date.now() + 86400000),
          token: 'test-token-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
        user: {
          id: userId1,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user1@example.com',
          emailVerified: true,
          name: 'User 1',
          image: null,
        },
      } as MockSessionReturnType);

      // Mock for first user - total is under limit but close
      const mockSelect1 = vi.fn();
      mockSelect1
        .mockReturnValueOnce({
          // Check global total - close but under
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 149_999_000, // Close to limit but not over
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Check user 1's usage
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${userId1}_${mockToday}`,
                  userId: userId1,
                  date: mockToday,
                  tokensUsed: 1_000_000, // Under personal limit
                  requestCount: 100,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Third call (after stream) - check global total for update
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 149_999_000,
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Fourth call (after stream) - check user's usage for update
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${userId1}_${mockToday}`,
                  userId: userId1,
                  date: mockToday,
                  tokensUsed: 1_000_000, // Under personal limit
                  requestCount: 100,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect1);

      // Mock update for user 1
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(drizzleClientHttp.update).mockImplementation(mockUpdate);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // First request should succeed
      const request1 = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Second user tries when total is now over limit
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: {
          id: 'session-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId2,
          expiresAt: new Date(Date.now() + 86400000),
          token: 'test-token-2',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
        user: {
          id: userId2,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user2@example.com',
          emailVerified: true,
          name: 'User 2',
          image: null,
        },
      } as MockSessionReturnType);

      // Mock for second user - total is now over limit
      const mockSelect2 = vi.fn();
      mockSelect2.mockReturnValueOnce({
        // Check global total - now exceeded
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalTokens: 5_000_100, // Over global limit
            },
          ]),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect2);

      // Second request should be rejected due to global limit
      const request2 = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(429);
      const body2 = await response2.json();
      expect(body2.error).toBe('Global daily token limit exceeded');
    });

    it('should allow requests when global limit is not exceeded even if one user is at their limit', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // First call - user at their personal limit but global is OK
      const mockSelect = vi.fn();
      mockSelect
        .mockReturnValueOnce({
          // Check global total - well under limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 10_000_000, // Well under global limit
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Check user's usage - at personal limit
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: `${mockUserId}_${mockToday}`,
                  userId: mockUserId,
                  date: mockToday,
                  tokensUsed: 3_000_000, // At personal daily limit
                  requestCount: 100,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      const body = await response.json();
      // Should be personal limit error, not global
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.details.dailyTokenLimit).toBe(3_000_000);
      expect(body.details.tokensUsed).toBe(3_000_000);
      // Should not have global limit details
      expect(body.details.dailyTotalTokenUsageLimit).toBeUndefined();
    });

    it('should reset limits for a new day', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - no record for today (new day)
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No record for today
          }),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Mock insert for new day's record
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(drizzleClientHttp.insert).mockImplementation(mockInsert);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Verify that select was called to check for today's record
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should reset global limit tracking on a new day', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database - new day, no records yet so total is 0
      const mockSelect = vi.fn();
      mockSelect
        .mockReturnValueOnce({
          // Check global total for new day - should be 0
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                totalTokens: 0, // No usage yet today
              },
            ]),
          }),
        })
        .mockReturnValueOnce({
          // Check user's usage - no record for today
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // No record for today
            }),
          }),
        });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      // Mock insert for new day's record
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(drizzleClientHttp.insert).mockImplementation(mockInsert);

      // Mock successful Gemini API response
      const mockStream = {
        stream: (async function* () {
          yield {
            candidates: [{ content: { text: 'test' }, finishReason: 'STOP', index: 0 }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
          };
        })(),
        response: Promise.resolve({
          candidates: [{ content: { text: 'test' }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      };

      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      vi.mocked(model.generateContentStream).mockResolvedValue(mockStream as any);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Verify both selects were called (global total and user usage)
      expect(mockSelect).toHaveBeenCalledTimes(2);
    });
  });
});
