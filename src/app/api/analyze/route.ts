import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const FLASK_URL = process.env.FLASK_API_URL ?? "http://127.0.0.1:5000";

interface ModelResult {
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

function mapStatus(label: ModelResult["label"]): AnalysisStatus {
  return label === "suspicious" ? "not_credible" : "credible";
}

function buildSpans(sourceText: string, groqSpans: GroqSpan[], tokenAttributions: ModelResult["tokenAttributions"]): HighlightedSpan[] {
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
      category: "linguistic_pattern",
      direction: attr.direction === "suspicious" ? "not_credible" : "credible",
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

async function getGroqVerdict(sourceText: string, model: ModelResult): Promise<GroqVerdict> {
  const fallback: GroqVerdict = {
    status: mapStatus(model.label),
    confidence: model.confidence,
    summary: `The text was classified as ${model.label.replace("_", " ")} with ${model.confidence}% confidence.`,
    spans: [],
  };
  if (!GROQ_API_KEY) return fallback;

  const tokenList = model.tokenAttributions
    .map((token) => `"${token.text}" (${token.direction.replace("_", " ")}, weight ${token.weight})`)
    .join(", ");

  const prompt = `A fine-tuned XLM-RoBERTa model classified this Taglish text as "${model.label.replace("_", " ")}" with ${model.confidence}% confidence.

Top influential tokens from Integrated Gradients: ${tokenList || "none"}

Text analyzed:
"${sourceText}"

Independently assess this text for misinformation signals. Respond with ONLY a valid JSON object, no markdown, no code fences:
{
  "status": "credible" | "not_credible" | "uncertain",
  "confidence": <integer 0-100>,
  "summary": "<1-2 plain English sentences explaining your verdict to a Filipino user, referencing specific parts of the text>",
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
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });
    const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
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

async function analyzeWithModel(sourceText: string): Promise<ModelResult | NextResponse> {
  try {
    const response = await fetch(`${FLASK_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sourceText }),
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `Model API error: ${detail}` }, { status: 502 });
    }
    return await response.json() as ModelResult;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the model server. Make sure the Flask API is running on port 5000." },
      { status: 502 },
    );
  }
}

export async function buildAnalysisResult(sourceText: string): Promise<AnalysisResult | NextResponse> {
  const model = await analyzeWithModel(sourceText);
  if (model instanceof NextResponse) return model;

  const groq = await getGroqVerdict(sourceText, model);
  const modelScores: ModelScore[] = [
    {
      model: "XLM-RoBERTa (TsekTxt Model)",
      credibleProbability: parseFloat(model.not_suspicious_probability.toFixed(3)),
      notCredibleProbability: parseFloat(model.suspicious_probability.toFixed(3)),
    },
    {
      model: "Groq LLaMA 3.3 (Language Analysis)",
      credibleProbability: groq.status === "credible" ? groq.confidence / 100 : 1 - groq.confidence / 100,
      notCredibleProbability: groq.status !== "credible" ? groq.confidence / 100 : 1 - groq.confidence / 100,
    },
  ];
  const agreeing = modelScores.filter((score) =>
    groq.status === "credible" ? score.credibleProbability > 0.5 : score.notCredibleProbability > 0.5
  ).length;

  return {
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    title: sourceText.slice(0, 44) || "Untitled analysis",
    sourceText,
    status: groq.status,
    confidence: groq.confidence,
    modelAgreement: Math.min(3, Math.max(1, agreeing)) as 1 | 2 | 3,
    modelScores,
    highlightedSpans: buildSpans(sourceText, groq.spans, model.tokenAttributions),
    summary: groq.summary,
    disclaimer: brand.disclaimer,
  };
}

export async function POST(request: Request) {
  let sourceText: string;
  try {
    const body = await request.json() as { sourceText?: unknown };
    if (typeof body.sourceText !== "string" || body.sourceText.trim().length < 10) {
      return NextResponse.json({ error: "sourceText must be at least 10 characters." }, { status: 400 });
    }
    sourceText = body.sourceText.trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await buildAnalysisResult(sourceText);
  return result instanceof NextResponse ? result : NextResponse.json(result);
}
