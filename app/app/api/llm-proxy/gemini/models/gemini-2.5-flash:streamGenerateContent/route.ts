import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Validate that API key is configured
  if (!process.env.GOOGLE_API_TOKEN) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_API_TOKEN not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log("LLM Proxy: Request received");

  try {
    // Parse the request body
    const body = await request.json();
    console.log("Request body", body);

    // Initialize Google Generative AI with API key from environment
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_TOKEN);

    // Initialize the Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Extract request parameters from the body
    const {
      contents,
      generationConfig,
      tools,
      toolConfig,
      systemInstruction,
    } = body;

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

    console.log("Starting stream generation with config:", requestConfig);

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the async streaming process
    (async () => {
      try {
        // Generate streaming content
        const result = await model.generateContentStream(requestConfig);

        let totalTokenUsage = null;
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
            filteredResponse.candidates = chunkData.candidates.map(
              (candidate: any) => ({
                content: candidate.content,
                finishReason: candidate.finishReason,
                index: candidate.index || 0,
              })
            );
          }

          // Add usage metadata if present
          if (chunkData.usageMetadata) {
            filteredResponse.usageMetadata = chunkData.usageMetadata;
            totalTokenUsage = chunkData.usageMetadata;
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

          console.log("Sent chunk:", sseChunk);
        }

        // Get the final response for complete metadata
        const finalResponse = await result.response;

        // Send final chunk with complete metadata
        const finalChunk = {
          candidates: finalResponse.candidates?.map((candidate: any, index: number) => ({
            content: candidate.content,
            finishReason: candidate.finishReason,
            index: index,
          })),
          usageMetadata: finalResponse.usageMetadata,
          modelVersion: modelVersion || "gemini-2.5-flash",
          responseId: responseId,
        };

        const sseFinalChunk = `data: ${JSON.stringify(finalChunk)}\n\n`;
        await writer.write(encoder.encode(sseFinalChunk));

        // Send the [DONE] marker
        await writer.write(encoder.encode("data: [DONE]\n\n"));

        // Log final token usage statistics
        if (finalResponse.usageMetadata) {
          console.log("\n=== TOTAL TOKEN USAGE ===");
          console.log(
            "Prompt Tokens:",
            finalResponse.usageMetadata.promptTokenCount
          );
          console.log(
            "Completion Tokens:",
            finalResponse.usageMetadata.candidatesTokenCount || 0
          );
          console.log(
            "Total Tokens:",
            finalResponse.usageMetadata.totalTokenCount
          );
          console.log("========================\n");
        }
      } catch (error) {
        console.error("Generation error:", error);

        // Send error in SSE format if streaming has started
        const errorChunk = `data: ${JSON.stringify({
          error: true,
          message: "Generation failed",
        })}\n\n`;
        await writer.write(encoder.encode(errorChunk));
      } finally {
        await writer.close();
      }
    })();

    // Return the stream as a response with SSE headers
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    // Handle any errors that occur during initial setup
    console.error("LLM Proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}