import { type NextRequest, NextResponse } from "next/server"

// Define interface for OpenAI model structure
interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

// Define interface for API response
interface OpenAIModelsResponse {
  data: OpenAIModel[];
  object: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // Fetch available models from OpenAI API
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key provided" }, { status: 401 })
      }
      return NextResponse.json({ error: "Failed to fetch models from OpenAI" }, { status: response.status })
    }

    const data = await response.json() as OpenAIModelsResponse
    
    // Filter for GPT models
    const gptModels = data.data
      .filter((model: OpenAIModel) => {
        const id = model.id.toLowerCase()
        return id.includes("gpt") && !id.includes("instruct")
      })
      .map((model: OpenAIModel) => ({
        id: model.id,
        name: model.id
      }))

    return NextResponse.json({ models: gptModels })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}