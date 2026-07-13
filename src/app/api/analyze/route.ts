import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
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

interface GroqInterpretation {
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

// Groq is interpreter only — uses the model's verdict, just explains it
async function getGroqInterpretation(sourceText: string, fastapi: FastAPIResult): Promise<GroqInterpretation> {
  const fallbackSummary = `The text was classified as ${fastapi.label.replace("_", " ")} with ${fastapi.confidence}% confidence by the XLM-RoBERTa model.`;
  if (!GROQ_API_KEY) return { summary: fallbackSummary, spans: [] };

  const tokenList = fastapi.tokenAttributions
    .map((t) => `"${t.text}" (${t.direction.replace("_", " ")}, weight ${t.weight})`)
    .join(", ");

  const prompt = `A fine-tuned XLM-RoBERTa model (chimsio/tsektxt-xlmr) has classified this Taglish text as "${fastapi.label.replace("_", " ")}" with ${fastapi.confidence}% confidence.

Top influential tokens from Integrated Gradients: ${tokenList || "none"}

Text analyzed:
"${sourceText}"

Your job is to EXPLAIN this verdict to a Filipino user — do NOT override or second-guess the model's classification. Respond with ONLY a valid JSON object, no markdown, no code fences:
{
  "summary": "<1-2 plain English sentences explaining WHY the model classified it this way, referencing specific phrases from the text>",
  "highlightedSpans": [
    {
      "phrase": "<exact substring from the text>",
      "category": "political_entity" | "election_term" | "taglish_expression" | "linguistic_pattern",
      "direction": "credible" | "not_credible",
      "weight": <0.0-1.0>,
      "explanation": "<one sentence why this phrase matters for the classification>"
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
    const parsed = JSON.parse(cleaned) as { summary: string; highlightedSpans: GroqSpan[] };
    return {
      summary: parsed.summary ?? fallbackSummary,
      spans: parsed.highlightedSpans ?? [],
    };
  } catch {
    return { summary: fallbackSummary, spans: [] };
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

  // Step 1: FastAPI model — primary verdict
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
    return NextResponse.json(
      { error: "Could not reach the model server. Make sure the FastAPI backend is running on port 8000." },
      { status: 502 }
    );
  }

  // Step 2: Groq — interpretation only, model verdict is final
  const groq = await getGroqInterpretation(sourceText, fastapi);

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
    title: sourceText.slice(0, 44) || "Untitled analysis",
    sourceText,
    status,
    confidence: fastapi.confidence,
    modelAgreement: agreeing as 1 | 2 | 3,
    modelScores,
    highlightedSpans: buildSpans(sourceText, groq.spans, fastapi.tokenAttributions),
    summary: groq.summary,
    disclaimer: brand.disclaimer,
  };

  return NextResponse.json(result);
}
