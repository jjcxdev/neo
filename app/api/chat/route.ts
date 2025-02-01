import { NextResponse } from "next/server";
import { SystemPrompt } from "@/lib/systemprompt";

type Message = {
  role: "user" | "assistant";
  content: string;
};

/**
 * API route handler for text generation requests to Ollama
 * Expects a POST request with a JSON body containing a 'prompt' field
 * Streams back the generated text response
 */
export async function POST(request: Request) {
  try {
    // Extract the prompt from the request body
    const { prompt, model, temperature, messages = [] } = await request.json();

    // Validate that a prompt was provided
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    // Format conversation history for context
    const conversationContext = messages
      .map((msg: Message) => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`)
      .join("\n");

    // Combine the prompt and context
    const fullPrompt = conversationContext
      ? `${conversationContext}\n\nHuman: ${prompt}\n\Assistant:`
      : `Human: ${prompt}\n\Assistant:`;

    // Make the request to the Ollama API
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model, // select model from dropdown
        prompt: fullPrompt, // Prompt to generate text from
        system: SystemPrompt, // System prompt to set AI behavior
        stream: true, // Enable streaming for real-time responses
        options: {
          temperature: temperature || 0.3, // set temperature
          top_p: 0.9, // set top_p
          stop: ["Human:", "Assistant"], // set stop token
        },
      }),
    });

    // Check if Ollama returned an error
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama responded with ${response.status}: ${errorData}`);
    }

    // Create a transform stream to process Ollama's response format
    // Ollama returns newline-delimited JSON, but we want to extract just the text
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        try {
          // Convert the binary chunk to text
          const text = new TextDecoder().decode(chunk);

          // Split into lines and remove empty ones
          const lines = text.split("\n").filter((line) => line.trim());

          // Process each line of the response
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                controller.enqueue(JSON.stringify({ response: data.response }) + "\n");
              }
            } catch (e) {
              console.log("Error parsing line:", e);
            }
          }
        } catch (error) {
          console.error("Error transforming chunk:", error);
          // We catch errors here to prevent the stream from breaking
          // Even if one chunk fails, we can still process others
        }
      },
    });

    // Connect Ollama's response stream to our transformer
    const readable = response.body?.pipeThrough(transformStream);

    // Ensure we actually got a response body
    if (!readable) {
      throw new Error("No response body received from Ollama");
    }

    // Return the transformed stream to the client
    // Setting appropriate headers for a streaming text response
    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "chunked",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error connecting to Ollama:", error);

    // Handle different types of errors with appropriate responses
    if (error instanceof Error) {
      // Special handling for connection refused errors
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          {
            error: "Failed to connect to Ollama",
            details: "Connection refused - Is Ollama running?",
            code: "ECONNREFUSED",
          },
          { status: 503 },
        ); // 503 Service Unavailable
      }

      // Handle all other known errors
      return NextResponse.json(
        {
          error: "Failed to connect to Ollama",
          details: error.message,
        },
        { status: 500 },
      ); // 500 Internal Server Error
    }

    // Fallback for unknown error types
    return NextResponse.json(
      {
        error: "Failed to connect to Ollama",
        details: "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
