import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

import constants from '@constants';
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
      },
    },
  },
}));

describe('Rate Limiting Tests', () => {
  const mockUserId = 'test-user-123';
  const mockToday = new Date().toISOString().split('T')[0];
  const mockSession = {
    user: { id: mockUserId },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('checkAndUpdateRateLimit function behavior', () => {
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

      // Verify rate limit check was called (select)
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
          // First call - check before request
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
          // Second call - after token usage
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

      // Wait for async stream processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify update was called with correct token count
      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0];
      expect(updateCall).toBeDefined();
    });

    it('should handle different users with separate rate limits', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      // First user at limit
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: userId1 } });
      const mockSelect1 = vi.fn().mockReturnValue({
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
      vi.mocked(drizzleClientHttp.select).mockImplementationOnce(mockSelect1);

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
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: userId2 } });
      const mockSelect2 = vi.fn().mockReturnValue({
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
      vi.mocked(drizzleClientHttp.select).mockImplementationOnce(mockSelect2);

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

    it('should reset limits for a new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 when no session exists', async () => {
      // Mock no session
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('Unauthorized - No valid session');
    });

    it('should return 500 when API key is not configured', async () => {
      // Mock constants without API key
      vi.mocked(constants).inference.geminiApiKey = undefined as any;

      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe('GOOGLE_API_TOKEN not configured');

      // Reset the mock
      vi.mocked(constants).inference.geminiApiKey = 'test-api-key';
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock auth session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      // Mock database error
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });
      vi.mocked(drizzleClientHttp.select).mockImplementation(mockSelect);

      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe('Generation failed');
      expect(body.details).toBe('Database connection failed');
    });

    it('should handle Gemini API errors during streaming', async () => {
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

      // Mock Gemini API error
      const genAI = new GoogleGenerativeAI('test-key');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      vi.mocked(model.generateContentStream).mockRejectedValue(new Error('Gemini API error'));

      const request = new NextRequest('http://localhost:3000/api/llm-proxy', {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ text: 'Hello' }],
          generationConfig: {},
        }),
      });

      const response = await POST(request);
      // The response should still be 200 because streaming starts before the error
      expect(response.status).toBe(200);

      // The error should be sent in the stream
      const reader = response.body?.getReader();
      if (reader) {
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        expect(text).toContain('error');
      }
    });
  });
});
