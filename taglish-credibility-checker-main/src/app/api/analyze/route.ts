import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const FLASK_URL = process.env.FLASK_API_URL ?? "http://127.0.0.1:5000";

interface FlaskResult {
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

function mapStatus(label: FlaskResult["label"]): AnalysisStatus {
  return label === "suspicious" ? "not_credible" : "credible";
}

function buildModelScores(flask: FlaskResult): ModelScore[] {
  return [{
    model: "XLM-RoBERTa (TsekTxt)",
    credibleProbability: parseFloat(flask.not_suspicious_probability.toFixed(3)),
    notCredibleProbability: parseFloat(flask.suspicious_probability.toFixed(3)),
  }];
}

function buildSpans(sourceText: string, groqSpans: GroqSpan[], tokenAttributions: FlaskResult["tokenAttributions"]): HighlightedSpan[] {
  // Try Groq spans first
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

  // Fall back to token attributions from the model
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

interface GroqVerdict {
  status: AnalysisStatus;
  confidence: number;
  summary: string;
  spans: GroqSpan[];
}

async function getGroqEnrichment(sourceText: string, flask: FlaskResult): Promise<GroqVerdict> {
  const fallback: GroqVerdict = {
    status: mapStatus(flask.label),
    confidence: flask.confidence,
    summary: `The text was classified as ${flask.label.replace("_", " ")} with ${flask.confidence}% confidence.`,
    spans: [],
  };
  if (!GROQ_API_KEY) return fallback;

  const tokenList = flask.tokenAttributions
    .map((t) => `"${t.text}" (${t.direction.replace("_", " ")}, weight ${t.weight})`)
    .join(", ");

  const prompt = `A fine-tuned XLM-RoBERTa model classified this Taglish text as "${flask.label.replace("_", " ")}" with ${flask.confidence}% confidence.

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
    const res = await fetch(GROQ_URL, {
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
  let sourceText: string;
  try {
    const body = (await request.json()) as { sourceText?: unknown };
    if (typeof body.sourceText !== "string" || body.sourceText.trim().length < 10) {
      return NextResponse.json({ error: "sourceText must be at least 10 characters." }, { status: 400 });
    }
    sourceText = body.sourceText.trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Step 1: Call Flask model
  let flask: FlaskResult;
  try {
    const flaskRes = await fetch(`${FLASK_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sourceText }),
    });
    if (!flaskRes.ok) {
      const err = await flaskRes.text();
      return NextResponse.json({ error: `Model API error: ${err}` }, { status: 502 });
    }
    flask = await flaskRes.json() as FlaskResult;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the model server. Make sure the Flask API is running on port 5000." },
      { status: 502 }
    );
  }

  // Step 2: Get Groq verdict + summary + highlighted spans
  const groq = await getGroqEnrichment(sourceText, flask);

  // Use Groq as the primary verdict, model as secondary
  const status = groq.status;
  const modelScores: ModelScore[] = [
    {
      model: "XLM-RoBERTa (TsekTxt Model)",
      credibleProbability: parseFloat(flask.not_suspicious_probability.toFixed(3)),
      notCredibleProbability: parseFloat(flask.suspicious_probability.toFixed(3)),
    },
    {
      model: "Groq LLaMA 3.3 (Language Analysis)",
      credibleProbability: groq.status === "credible" ? groq.confidence / 100 : 1 - groq.confidence / 100,
      notCredibleProbability: groq.status !== "credible" ? groq.confidence / 100 : 1 - groq.confidence / 100,
    },
  ];

  const agreeing = modelScores.filter((s) =>
    status === "credible" ? s.credibleProbability > 0.5 : s.notCredibleProbability > 0.5
  ).length;

  const result: AnalysisResult = {
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    title: sourceText.slice(0, 44) || "Untitled analysis",
    sourceText,
    status,
    confidence: groq.confidence,
    modelAgreement: Math.min(3, Math.max(1, agreeing)) as 1 | 2 | 3,
    modelScores,
    highlightedSpans: buildSpans(sourceText, groq.spans, flask.tokenAttributions),
    summary: groq.summary,
    disclaimer: brand.disclaimer,
  };

  return NextResponse.json(result);
}
