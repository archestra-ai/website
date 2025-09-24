import { GoogleGenerativeAI } from '@google/generative-ai';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';

import constants from '@constants';
import { auth } from '@lib/db/auth';
import { drizzleClientHttp } from '@lib/db/db';
import { tokenUsageTable } from '@lib/db/schema/token-usage';

const {
  inference: {
    geminiApiKey,
    rateLimits: { dailyTokenLimit, dailyTotalTokenUsageLimit },
  },
} = constants;

async function checkAndUpdateTokenUsage(
  userId: string,
  tokensToAdd: number = 0
): Promise<{
  allowed: boolean;
  tokensUsed: number;
  globalLimitExceeded?: boolean;
  totalTokensUsedToday?: number;
}> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // First check the global daily limit across all users
  const totalUsageResult = await drizzleClientHttp
    .select({
      totalTokens: sql<number>`COALESCE(SUM(${tokenUsageTable.tokensUsed}), 0)`,
    })
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.date, today));

  const totalTokensUsedToday = Number(totalUsageResult[0]?.totalTokens || 0);

  // Check if global limit would be exceeded
  if (totalTokensUsedToday + tokensToAdd > dailyTotalTokenUsageLimit) {
    return {
      allowed: false,
      tokensUsed: 0,
      globalLimitExceeded: true,
      totalTokensUsedToday,
    };
  }

  // Get or create token usage record for today
  const existingLimit = await drizzleClientHttp
    .select()
    .from(tokenUsageTable)
    .where(and(eq(tokenUsageTable.userId, userId), eq(tokenUsageTable.date, today)))
    .limit(1);

  if (existingLimit.length === 0) {
    // No record exists for today
    if (tokensToAdd === 0) {
      // Just checking - user hasn't used any tokens today
      return {
        allowed: true,
        tokensUsed: 0,
      };
    }

    // Create new record for today with initial token usage
    const newRecord = {
      id: `${userId}_${today}`,
      userId,
      date: today,
      tokensUsed: tokensToAdd,
    };

    await drizzleClientHttp.insert(tokenUsageTable).values(newRecord);

    return {
      allowed: true,
      tokensUsed: tokensToAdd,
    };
  }

  const current = existingLimit[0];

  // Check if limits would be exceeded
  if (tokensToAdd === 0) {
    // Just checking, not updating
    return {
      allowed: current.tokensUsed < dailyTokenLimit,
      tokensUsed: current.tokensUsed,
    };
  }

  // Update the record with new token usage
  await drizzleClientHttp
    .update(tokenUsageTable)
    .set({
      tokensUsed: current.tokensUsed + tokensToAdd,
      updatedAt: new Date(),
    })
    .where(and(eq(tokenUsageTable.userId, userId), eq(tokenUsageTable.date, today)));

  return {
    allowed: true,
    tokensUsed: current.tokensUsed + tokensToAdd,
  };
}

export async function POST(request: NextRequest) {
  // Validate that API key is configured
  if (!geminiApiKey) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_TOKEN not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  console.log(session);

  // Check if user is authenticated
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized - No valid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;

  // Check token usage limit before processing
  const tokenUsageCheck = await checkAndUpdateTokenUsage(userId, 0);
  if (!tokenUsageCheck.allowed) {
    const errorMessage = tokenUsageCheck.globalLimitExceeded
      ? 'Global daily token limit exceeded'
      : 'Rate limit exceeded';

    const errorDetails: any = tokenUsageCheck.globalLimitExceeded
      ? {
          dailyTotalTokenUsageLimit,
          totalTokensUsedToday: tokenUsageCheck.totalTokensUsedToday,
          message: 'The total token usage across all users has exceeded the daily limit. Please try again tomorrow.',
        }
      : {
          dailyTokenLimit,
          tokensUsed: tokenUsageCheck.tokensUsed,
        };

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  console.log(`LLM Proxy: Request received from user ${userId}`);

  try {
    // Parse the request body
    const body = await request.json();
    console.log('Request body', body);

    // Initialize Google Generative AI with API key from environment
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Initialize the Gemini 2.5 Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Extract request parameters from the body
    const { contents, generationConfig, tools, toolConfig, systemInstruction } = body;

    // Prepare the request configuration
    const requestConfig: any = {
      contents,
      generationConfig,
    };

    // Add optional parameters if they exist
    if (tools) {
      requestConfig.tools = tools;
    }
    if (toolConfig) {
      requestConfig.toolConfig = toolConfig;
    }
    if (systemInstruction) {
      requestConfig.systemInstruction = systemInstruction;
    }

    console.log('Starting stream generation with config:', requestConfig);

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the async streaming process (capture userId in closure)
    const streamUserId = userId;
    (async () => {
      try {
        // Generate streaming content
        const result = await model.generateContentStream(requestConfig);

        let responseId = null;
        let modelVersion = null;

        // Process the stream
        for await (const chunk of result.stream) {
          // Get the chunk data
          const chunkData = chunk;

          // Build filtered response matching the expected format
          const filteredResponse: any = {};

          // Add candidates if present
          if (chunkData.candidates) {
            filteredResponse.candidates = chunkData.candidates.map((candidate: any) => ({
              content: candidate.content,
              finishReason: candidate.finishReason,
              index: candidate.index || 0,
            }));
          }

          // Add usage metadata if present
          if (chunkData.usageMetadata) {
            filteredResponse.usageMetadata = chunkData.usageMetadata;
          }

          // Add other metadata
          if ((chunkData as any).modelVersion) {
            filteredResponse.modelVersion = (chunkData as any).modelVersion;
            modelVersion = (chunkData as any).modelVersion;
          }

          if ((chunkData as any).responseId) {
            filteredResponse.responseId = (chunkData as any).responseId;
            responseId = (chunkData as any).responseId;
          }

          // Send the chunk in SSE format
          const sseChunk = `data: ${JSON.stringify(filteredResponse)}\n\n`;
          await writer.write(encoder.encode(sseChunk));

          console.log('Sent chunk:', sseChunk);
        }

        // Get the final response for complete metadata
        const finalResponse = await result.response;

        // Send final chunk with metadata only (content was already streamed)
        const finalChunk = {
          usageMetadata: finalResponse.usageMetadata,
          modelVersion: modelVersion || 'gemini-2.5-pro',
          responseId: responseId,
        };

        const sseFinalChunk = `data: ${JSON.stringify(finalChunk)}\n\n`;
        await writer.write(encoder.encode(sseFinalChunk));

        // Send the [DONE] marker
        await writer.write(encoder.encode('data: [DONE]\n\n'));

        // Log final token usage statistics and update rate limit
        if (finalResponse.usageMetadata) {
          const totalTokens = finalResponse.usageMetadata.totalTokenCount || 0;

          console.log('\n=== TOTAL TOKEN USAGE ===');
          console.log('Prompt Tokens:', finalResponse.usageMetadata.promptTokenCount);
          console.log('Completion Tokens:', finalResponse.usageMetadata.candidatesTokenCount || 0);
          console.log('Total Tokens:', totalTokens);
          console.log('========================\n');

          // Update token usage with actual tokens used
          await checkAndUpdateTokenUsage(streamUserId, totalTokens);
        }
      } catch (error) {
        console.error('Generation error:', error);

        // Send error in SSE format if streaming has started
        const errorChunk = `data: ${JSON.stringify({
          error: true,
          message: 'Generation failed',
        })}\n\n`;
        await writer.write(encoder.encode(errorChunk));
      } finally {
        await writer.close();
      }
    })();

    // Return the stream as a response with SSE headers
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    // Handle any errors that occur during initial setup
    console.error('LLM Proxy error:', error);

    return new Response(
      JSON.stringify({
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
