import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // First check if we have a prompt
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Try to connect to Ollama
    const response = await fetch("http://192.168.2.23:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:latest",
        prompt: prompt,
        stream: true,
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        {
          error: "Failed to connect to Ollama",
          details: errorData,
          status: response.status,
        },
        { status: response.status },
      );
    }

    // Forward the stream from Ollama
    return new NextResponse(response.body);
  } catch (error) {
    console.error("Error connecting to Ollama", error);

    // Check if its a connection refused error
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          {
            error: "Failed to connect to Ollama",
            details: "Connection refused",
            code: "ECONNREFUSED",
          },
          { status: 503 },
        );
      }
    }
    return NextResponse.json(
      {
        error: "Failed to connect to Ollama",
        details: error instanceof Error ? error.message : "Unkown error",
      },
      { status: 500 },
    );
  }
}
