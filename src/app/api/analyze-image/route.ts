import { NextResponse } from "next/server";
import { buildAnalysisResult } from "@/app/api/analyze/route";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          { type: "text", text: "Extract all text from this image exactly as it appears. Return only the extracted text, no commentary." },
        ],
      }],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) throw new Error(`Vision model error ${response.status}`);
  const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function POST(request: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  let base64Image: string;
  let mimeType: string;
  try {
    const body = await request.json() as { base64Image?: unknown; mimeType?: unknown };
    if (typeof body.base64Image !== "string" || !body.base64Image) {
      return NextResponse.json({ error: "base64Image is required." }, { status: 400 });
    }
    if (typeof body.mimeType !== "string" || !body.mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Valid mimeType is required." }, { status: 400 });
    }
    base64Image = body.base64Image;
    mimeType = body.mimeType;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let sourceText: string;
  try {
    sourceText = await extractTextFromImage(base64Image, mimeType);
    if (!sourceText || sourceText.trim().length < 10) {
      return NextResponse.json({ error: "Could not extract enough text from the image. Try a clearer image with more text." }, { status: 422 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to extract text from image." }, { status: 502 });
  }

  const result = await buildAnalysisResult(sourceText.trim());
  return result instanceof NextResponse ? result : NextResponse.json({ ...result, extractedText: sourceText.trim() });
}
