import { NextResponse } from "next/server";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";
import { brand } from "@/config/brand";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Shape Groq must return as JSON
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

const SYSTEM_PROMPT = `You are a Taglish misinformation detection assistant specialized in Filipino election content.

Analyze the given Taglish (Filipino-English code-switched) text for misinformation-associated language signals.

You must respond with ONLY a valid JSON object — no markdown, no explanation, no code fences. The JSON must follow this exact schema:

{
  "status": "credible" | "not_credible" | "uncertain",
  "confidence": <integer 0-100, how confident you are in the classification>,
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
      "weight": <0.0-1.0, how strongly this phrase influenced the score>,
      "explanation": "<one sentence why this phrase matters>"
    }
  ]
}

Classification rules:
- "credible": text promotes verification, cites official sources, lacks urgency/hearsay markers
- "not_credible": contains urgency ("share now", "bago ma-delete"), hearsay ("daw", "raw", "sabi nila"), unverified claims, conspiracy framing
- "uncertain": mixed signals or not enough context

Taglish signals to watch for:
- Hearsay markers: daw, raw, sabi nila, sabi ni, diumano
- Urgency: "i-share na", "share agad", "bago ma-delete", "viral na"
- Dismissal of official sources: "fake yung official count", "rigged"
- Credibility boosters: "ayon sa official", "check muna", "i-verify natin", reference to COMELEC or credible institutions
- Emotional amplifiers: "grabe", "shocking", "hindi kapani-paniwala"

For modelScores: simulate three slightly different perspectives — RoBERTa-Tagalog is most sensitive to Tagalog hearsay markers, mBERT is more conservative, XLM-RoBERTa balances both. The two probabilities for each model must sum to exactly 1.0.

For highlightedSpans: include 2-5 of the most influential phrases. Each "phrase" must be an exact substring from the input text — copy it character for character.

Keep the summary in plain English. Be direct and honest — this is for a research prototype.`;

function resolveSpans(sourceText: string, rawSpans: GroqAnalysis["highlightedSpans"]): HighlightedSpan[] {
  const resolved: HighlightedSpan[] = [];
  for (const span of rawSpans) {
    const start = sourceText.indexOf(span.phrase);
    if (start === -1) continue; // skip if phrase not actually in text
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
  // fallback if no spans matched
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

export async function POST(request: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

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

  // Call Groq
  let groqData: GroqAnalysis;
  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this text:\n\n${sourceText}` },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: `Groq API returned ${groqResponse.status}: ${errorText}` },
        { status: 502 }
      );
    }

    const groqJson = await groqResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawText = groqJson.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences if model wraps output despite instructions
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    groqData = JSON.parse(cleaned) as GroqAnalysis;
  } catch (err) {
    console.error("Failed to parse Groq response:", err);
    return NextResponse.json(
      { error: "Could not parse the analysis response. Please try again." },
      { status: 502 }
    );
  }

  // Validate status field
  const validStatuses: AnalysisStatus[] = ["credible", "not_credible", "uncertain"];
  if (!validStatuses.includes(groqData.status)) {
    groqData.status = "uncertain";
  }

  const result: AnalysisResult = {
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    title: sourceText.slice(0, 44) || "Untitled analysis",
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

  return NextResponse.json(result);
}
