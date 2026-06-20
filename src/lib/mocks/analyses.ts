import { brand } from "@/config/brand";
import type { AnalysisResult, AnalysisStatus, HighlightCategory, HighlightedSpan, ModelScore } from "@/types/analysis";

const now = Date.now();

const scores = {
  credible: [
    { model: "RoBERTa-Tagalog", credibleProbability: 0.86, notCredibleProbability: 0.14 },
    { model: "mBERT", credibleProbability: 0.81, notCredibleProbability: 0.19 },
    { model: "XLM-RoBERTa", credibleProbability: 0.84, notCredibleProbability: 0.16 },
  ],
  not_credible: [
    { model: "RoBERTa-Tagalog", credibleProbability: 0.18, notCredibleProbability: 0.82 },
    { model: "mBERT", credibleProbability: 0.24, notCredibleProbability: 0.76 },
    { model: "XLM-RoBERTa", credibleProbability: 0.2, notCredibleProbability: 0.8 },
  ],
  uncertain: [
    { model: "RoBERTa-Tagalog", credibleProbability: 0.54, notCredibleProbability: 0.46 },
    { model: "mBERT", credibleProbability: 0.47, notCredibleProbability: 0.53 },
    { model: "XLM-RoBERTa", credibleProbability: 0.58, notCredibleProbability: 0.42 },
  ],
} satisfies Record<AnalysisStatus, ModelScore[]>;

function span(text: string, phrase: string, category: HighlightCategory, direction: "credible" | "not_credible", weight: number, explanation: string): HighlightedSpan | null {
  const start = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (start < 0) return null;
  return {
    id: `${phrase.toLowerCase().replace(/\W+/g, "-")}-${start}`,
    start,
    end: start + phrase.length,
    text: text.slice(start, start + phrase.length),
    category,
    direction,
    weight,
    explanation,
  };
}

function spansFor(text: string, status: AnalysisStatus): HighlightedSpan[] {
  const candidates = [
    span(text, "Candidate A", "political_entity", "not_credible", 0.72, "Candidate references can strongly influence election-content classification."),
    span(text, "local election office", "political_entity", "credible", 0.68, "Mentions of official election bodies can support credibility when framed carefully."),
    span(text, "official results", "election_term", "credible", 0.64, "Election-result terms often need verification against official sources."),
    span(text, "viral thread", "linguistic_pattern", "not_credible", 0.7, "Viral-source framing can correlate with lower credibility signals."),
    span(text, "daw", "taglish_expression", "not_credible", 0.56, "Hearsay markers like daw may indicate the claim is being relayed without direct evidence."),
    span(text, "Check muna", "taglish_expression", "credible", 0.52, "Cautionary Taglish phrasing can signal verification intent."),
  ].filter((item): item is HighlightedSpan => Boolean(item));

  if (candidates.length > 0) return candidates.slice(0, 5);
  const words = text.trim().split(/\s+/).slice(0, 4).join(" ");
  return [
    {
      id: "general-language-pattern",
      start: 0,
      end: Math.max(words.length, 1),
      text: text.slice(0, Math.max(words.length, 1)),
      category: "linguistic_pattern",
      direction: status === "credible" ? "credible" : "not_credible",
      weight: 0.42,
      explanation: "The model found broad language-pattern signals, but no strong named phrase in the demo parser.",
    },
  ];
}

function createAnalysis(partial: Omit<AnalysisResult, "disclaimer" | "highlightedSpans">): AnalysisResult {
  return {
    ...partial,
    disclaimer: brand.disclaimer,
    highlightedSpans: spansFor(partial.sourceText, partial.status),
  };
}

export const mockAnalyses: AnalysisResult[] = [
  createAnalysis({
    id: "ana-credible-001",
    title: "Official results reminder",
    createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
    sourceText: brand.sampleText,
    status: "credible",
    confidence: 84,
    modelAgreement: 3,
    modelScores: scores.credible,
    summary: "Few misinformation-associated signals were detected. This does not guarantee that the content is accurate.",
  }),
  createAnalysis({
    id: "ana-not-credible-002",
    title: "Viral thread warning",
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    sourceText:
      "Viral thread says Candidate A already lost pero may secret count daw. Share now before ma-delete, kahit wala pang official results from the local election office.",
    status: "not_credible",
    confidence: 81,
    modelAgreement: 3,
    modelScores: scores.not_credible,
    summary: "Urgent sharing language, hearsay markers, and unsupported election-result framing raise the suspiciousness score.",
  }),
  createAnalysis({
    id: "ana-uncertain-003",
    title: "Short precinct note",
    createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    sourceText: "Candidate A visited the precinct today. Waiting pa sa official results.",
    status: "uncertain",
    confidence: 58,
    modelAgreement: 1,
    modelScores: scores.uncertain,
    summary: "The text is brief and the model signals are mixed, so the suspiciousness estimate needs more context.",
  }),
  createAnalysis({
    id: "ana-mixed-004",
    title: "Mixed model prediction",
    createdAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
    sourceText:
      "Local election office posted reminders, pero the caption says Candidate A has sure win daw based on unofficial tallies.",
    status: "uncertain",
    confidence: 62,
    modelAgreement: 2,
    modelScores: [
      { model: "RoBERTa-Tagalog", credibleProbability: 0.43, notCredibleProbability: 0.57 },
      { model: "mBERT", credibleProbability: 0.52, notCredibleProbability: 0.48 },
      { model: "XLM-RoBERTa", credibleProbability: 0.38, notCredibleProbability: 0.62 },
    ],
    summary: "Official-source references and unsupported certainty appear together, producing a suspicious but mixed result.",
  }),
  createAnalysis({
    id: "ana-credible-005",
    title: "Verification-first caption",
    createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    sourceText:
      "Before sharing, check the local election office page for official results and compare updates from accredited sources.",
    status: "credible",
    confidence: 78,
    modelAgreement: 3,
    modelScores: scores.credible,
    summary: "Few misinformation-associated signals were detected because the text encourages verification and avoids unsupported outcomes.",
  }),
  createAnalysis({
    id: "ana-error-006",
    title: "Demo parser error state",
    createdAt: new Date(now - 1000 * 60 * 60 * 96).toISOString(),
    sourceText: "Demo item for showing how the interface handles an analysis error state.",
    status: "uncertain",
    confidence: 0,
    modelAgreement: 1,
    modelScores: scores.uncertain,
    summary: "This sample is reserved for demonstrating graceful error handling in mock mode.",
  }),
];

export function buildMockAnalysis(text: string): AnalysisResult {
  const lowered = text.toLowerCase();
  const status: AnalysisStatus = lowered.includes("viral") || lowered.includes("secret") || lowered.includes("share now")
    ? "not_credible"
    : lowered.length < 140 || lowered.includes("maybe")
      ? "uncertain"
      : "credible";
  const confidence = status === "credible" ? 82 : status === "not_credible" ? 79 : 57;
  return createAnalysis({
    id: `ana-${Math.random().toString(36).slice(2, 9)}`,
    title: text.slice(0, 44) || "Untitled analysis",
    createdAt: new Date().toISOString(),
    sourceText: text,
    status,
    confidence,
    modelAgreement: status === "uncertain" ? 2 : 3,
    modelScores: scores[status],
    summary:
      status === "credible"
        ? "Few misinformation-associated signals were detected. This does not guarantee that the content is accurate."
        : status === "not_credible"
          ? "The text contains urgency, hearsay, or unsupported election-result signals that raise suspicion."
          : "The available text is short or mixed, so the suspiciousness estimate needs more context.",
  });
}
