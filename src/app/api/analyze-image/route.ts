import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

interface FastAPIResult {
  label: "suspicious" | "not_suspicious";
  suspicious_probability: number;
  not_suspicious_probability: number;
  confidence: number;
  tokenAttributions: Array<{
    text: string;
    start: number;
    end: number;
    weight: number;
    direction: "suspicious" | "not_suspicious";
  }>;
  modelScores?: Array<{
    model: string;
    suspicious_probability: number;
    not_suspicious_probability: number;
  }>;
}

interface GroqSpan {
  phrase: string;
  category: HighlightCategory;
  direction: "credible" | "not_credible";
  weight: number;
  explanation: string;
}

interface GroqVerdict {
  status: AnalysisStatus;
  confidence: number;
  summary: string;
  spans: GroqSpan[];
}

function mapStatus(label: FastAPIResult["label"]): AnalysisStatus {
  return label === "suspicious" ? "not_credible" : "credible";
}

function buildSpans(sourceText: string, groqSpans: GroqSpan[], tokenAttributions: FastAPIResult["tokenAttributions"]): HighlightedSpan[] {
  const resolved: HighlightedSpan[] = [];
  for (const span of groqSpans) {
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
  if (resolved.length) return resolved;

  if (tokenAttributions.length) {
    return tokenAttributions.map((attr) => ({
      id: `${attr.text.toLowerCase().replace(/\W+/g, "-")}-${attr.start}`,
      start: attr.start,
      end: attr.end,
      text: attr.text,
      category: "linguistic_pattern" as HighlightCategory,
      direction: attr.direction === "suspicious" ? "not_credible" : ("credible" as "credible" | "not_credible"),
      weight: attr.weight,
      explanation: `This token contributed to the ${attr.direction.replace("_", " ")} classification.`,
    }));
  }

  const fallback = sourceText.trim().split(/\s+/).slice(0, 4).join(" ");
  return [{
    id: "general-language-pattern",
    start: 0,
    end: fallback.length,
    text: fallback,
    category: "linguistic_pattern",
    direction: "not_credible",
    weight: 0.3,
    explanation: "No specific phrases were flagged; general language patterns were evaluated.",
  }];
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
          role: "system",
          content: "You are a text extraction tool. Output ONLY the raw text found in images. Never add introductions, labels, descriptions, or commentary. Do not start with phrases like 'This image contains' or 'The text in the image is'. Just output the text directly.",
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            { type: "text", text: "Copy every piece of text and emoji visible in this image exactly as it appears. Output ONLY the raw text — no introductions, no labels, no descriptions, no commentary. Do not say 'this image contains' or anything similar. Just the text itself." },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });
  if (!response.ok) throw new Error(`Vision model error ${response.status}`);
  const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  let text = json.choices?.[0]?.message?.content?.trim() ?? "";
  // Strip any preamble the model might still add
  text = text.replace(/^(this image contains[:\s]*|the text (in|from) the image[:\s]*|here is the (extracted )?text[:\s]*)/i, "").trim();
  return text;
}

async function getGroqVerdict(sourceText: string, fastapi: FastAPIResult): Promise<GroqVerdict> {
  const fallback: GroqVerdict = {
    status: mapStatus(fastapi.label),
    confidence: fastapi.confidence,
    summary: `The text was classified as ${fastapi.label.replace("_", " ")} with ${fastapi.confidence}% confidence.`,
    spans: [],
  };
  if (!GROQ_API_KEY) return fallback;

  const tokenList = fastapi.tokenAttributions
    .map((t) => `"${t.text}" (${t.direction.replace("_", " ")}, weight ${t.weight})`)
    .join(", ");

  const prompt = `A fine-tuned XLM-RoBERTa model classified this Taglish text as "${fastapi.label.replace("_", " ")}" with ${fastapi.confidence}% confidence.

Top influential tokens from Integrated Gradients: ${tokenList || "none"}

Text analyzed:
"${sourceText}"

Independently assess this text for misinformation signals. Respond with ONLY a valid JSON object, no markdown, no code fences:
{
  "status": "credible" | "not_credible" | "uncertain",
  "confidence": <integer 0-100>,
  "summary": "<1-2 plain English sentences explaining your verdict to a Filipino user>",
  "highlightedSpans": [
    {
      "phrase": "<exact substring from the text>",
      "category": "political_entity" | "election_term" | "taglish_expression" | "linguistic_pattern",
      "direction": "credible" | "not_credible",
      "weight": <0.0-1.0>,
      "explanation": "<one sentence why this phrase matters>"
    }
  ]
}

Include 2-5 highlighted spans. Each phrase must be an exact substring of the input text.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });
    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as { status: AnalysisStatus; confidence: number; summary: string; highlightedSpans: GroqSpan[] };
    return {
      status: parsed.status ?? fallback.status,
      confidence: parsed.confidence ?? fallback.confidence,
      summary: parsed.summary ?? fallback.summary,
      spans: parsed.highlightedSpans ?? [],
    };
  } catch {
    return fallback;
  }
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

  // Step 1: OCR via Groq vision
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

  // Step 2: FastAPI model classification
  let fastapi: FastAPIResult;
  try {
    const fastapiRes = await fetch(`${FASTAPI_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sourceText }),
    });
    if (!fastapiRes.ok) {
      const err = await fastapiRes.text();
      return NextResponse.json({ error: `Model API error: ${err}` }, { status: 502 });
    }
    fastapi = await fastapiRes.json() as FastAPIResult;
  } catch {
    return NextResponse.json({ error: "Could not reach the model server. Make sure the FastAPI backend is running on port 8000." }, { status: 502 });
  }

  // Step 3: Groq interpretation — explains the model's verdict
  const groq = await getGroqVerdict(sourceText, fastapi);

  const status = mapStatus(fastapi.label);

  const modelScores: ModelScore[] = fastapi.modelScores
    ? fastapi.modelScores.map((score) => ({
        model: score.model,
        credibleProbability: parseFloat(score.not_suspicious_probability.toFixed(3)),
        notCredibleProbability: parseFloat(score.suspicious_probability.toFixed(3)),
      }))
    : [
        {
          model: "XLM-RoBERTa (TsekTxt)",
          credibleProbability: parseFloat(fastapi.not_suspicious_probability.toFixed(3)),
          notCredibleProbability: parseFloat(fastapi.suspicious_probability.toFixed(3)),
        },
      ];

  const agreeing = modelScores.filter((s) =>
    status === "credible" ? s.credibleProbability > 0.5 : s.notCredibleProbability > 0.5
  ).length;

  const result: AnalysisResult = {
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    title: sourceText.slice(0, 44) || "Image analysis",
    sourceText,
    status,
    confidence: fastapi.confidence,
    modelAgreement: agreeing as 1 | 2 | 3,
    modelScores,
    highlightedSpans: buildSpans(sourceText, groq.spans, fastapi.tokenAttributions),
    summary: groq.summary,
    disclaimer: brand.disclaimer,
  };

  return NextResponse.json({ ...result, extractedText: sourceText });
}
