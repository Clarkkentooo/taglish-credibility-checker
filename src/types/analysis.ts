export type AnalysisStatus = "credible" | "not_credible" | "uncertain";

export type HighlightCategory =
  | "political_entity"
  | "election_term"
  | "taglish_expression"
  | "linguistic_pattern";

export interface ModelScore {
  model: string;
  credibleProbability: number;
  notCredibleProbability: number;
}

export interface HighlightedSpan {
  id: string;
  start: number;
  end: number;
  text: string;
  category: HighlightCategory;
  direction: "credible" | "not_credible";
  weight: number;
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  title: string;
  sourceText: string;
  status: AnalysisStatus;
  confidence: number;
  modelAgreement: 1 | 2 | 3;
  modelScores: ModelScore[];
  highlightedSpans: HighlightedSpan[];
  summary: string;
  disclaimer: string;
}

export interface FeedbackPayload {
  helpful?: boolean;
  correctedLabel?: AnalysisStatus;
  note?: string;
}
