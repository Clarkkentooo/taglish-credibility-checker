import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";

interface GroqAnalysis {
  status: AnalysisStatus;
  confidence: number;
  summary: string;
  modelScores: ModelScore[];
  highlightedSpans: Array<{
    phrase: string;
    category: HighlightCategory;
    direction: "credible" | "not_credible";
    weight: number;
    explanation: string;
  }>;
}

const ANALYSIS_SYSTEM_PROMPT = `You are a Taglish misinformation detection assistant specialized in Filipino election content.

Analyze the given Taglish (Filipino-English code-switched) text for misinformation-associated language signals.

You must respond with ONLY a valid JSON object — no markdown, no explanation, no code fences. The JSON must follow this exact schema:

{
  "status": "credible" | "not_credible" | "uncertain",
  "confidence": <integer 0-100>,
  "summary": "<1-2 sentence plain-language explanation of your verdict>",
  "modelScores": [
    { "model": "RoBERTa-Tagalog", "credibleProbability": <0.0-1.0>, "notCredibleProbability": <0.0-1.0> },
    { "model": "mBERT", "credibleProbability": <0.0-1.0>, "notCredibleProbability": <0.0-1.0> },
    { "model": "XLM-RoBERTa", "credibleProbability": <0.0-1.0>, "notCredibleProbability": <0.0-1.0> }
  ],
  "highlightedSpans": [
    {
      "phrase": "<exact substring from the input text>",
      "category": "political_entity" | "election_term" | "taglish_expression" | "linguistic_pattern",
      "direction": "credible" | "not_credible",
      "weight": <0.0-1.0>,
      "explanation": "<one sentence why this phrase matters>"
    }
  ]
}

Classification rules:
- "credible": promotes verification, cites official sources, lacks urgency/hearsay markers
- "not_credible": contains urgency, hearsay ("daw", "raw", "sabi nila"), unverified claims, conspiracy framing
- "uncertain": mixed signals or not enough context

For modelScores: the two probabilities for each model must sum to exactly 1.0.
For highlightedSpans: include 2-5 most influential phrases, each must be an exact substring of the input text.`;

function resolveSpans(sourceText: string, rawSpans: GroqAnalysis["highlightedSpans"]): HighlightedSpan[] {
  const resolved: HighlightedSpan[] = [];
  for (const span of rawSpans) {
    const start = sourceText.indexOf(span.phrase);
    if (start === -1) continue;
    resolved.push({
      id: `${span.phrase.toLowerCase().replace(/\W+/g, "-")}-${start}`,
      start,
      end: start + span.phrase.length,
      text: span.phrase,
      category: span.category,
      direction: span.direction,
      weight: span.weight,
      explanation: span.explanation,
    });
  }
  if (resolved.length === 0) {
    const fallback = sourceText.trim().split(/\s+/).slice(0, 4).join(" ");
    resolved.push({
      id: "general-language-pattern",
      start: 0,
      end: fallback.length,
      text: fallback,
      category: "linguistic_pattern",
      direction: "not_credible",
      weight: 0.3,
      explanation: "No specific phrases were flagged; general language patterns were evaluated.",
    });
  }
  return resolved;
}

async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: "text",
              text: "Extract all text from this image exactly as it appears. Return only the extracted text, no commentary.",
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Vision model error ${response.status}: ${err}`);
  }

  const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

async function analyzeExtractedText(sourceText: string): Promise<GroqAnalysis> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_TEXT_MODEL,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this text:\n\n${sourceText}` },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Analysis model error ${response.status}: ${err}`);
  }

  const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as GroqAnalysis;
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
      return NextResponse.json({ error: "Valid mimeType is required (e.g. image/jpeg)." }, { status: 400 });
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
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json({ error: "Failed to extract text from image." }, { status: 502 });
  }

  let groqData: GroqAnalysis;
  try {
    groqData = await analyzeExtractedText(sourceText);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Could not parse the analysis response. Please try again." }, { status: 502 });
  }

  const validStatuses: AnalysisStatus[] = ["credible", "not_credible", "uncertain"];
  if (!validStatuses.includes(groqData.status)) groqData.status = "uncertain";

  const result: AnalysisResult = {
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    title: sourceText.slice(0, 44) || "Image analysis",
    sourceText,
    status: groqData.status,
    confidence: Math.min(100, Math.max(0, Math.round(groqData.confidence))),
    modelAgreement: (() => {
      const threshold = 0.5;
      const agreeing = groqData.modelScores.filter((s) =>
        groqData.status === "credible"
          ? s.credibleProbability > threshold
          : s.notCredibleProbability > threshold
      ).length;
      return Math.min(3, Math.max(1, agreeing)) as 1 | 2 | 3;
    })(),
    modelScores: groqData.modelScores,
    highlightedSpans: resolveSpans(sourceText, groqData.highlightedSpans),
    summary: groqData.summary,
    disclaimer: brand.disclaimer,
  };

  return NextResponse.json({ ...result, extractedText: sourceText });
}
