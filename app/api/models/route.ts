import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    const response = await fetch(`${ollamaHost}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
