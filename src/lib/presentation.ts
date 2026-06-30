import type { AnalysisResult, AnalysisStatus } from "@/types/analysis";

export type SuspicionLevel = "not_suspicious" | "suspicious" | "highly_suspicious";

export interface SuspicionPresentation {
  level: SuspicionLevel;
  label: "Not Suspicious" | "Likely Suspicious" | "Suspicious";
  score: number;
  tone: "calm" | "warning" | "severe";
  interpretation: string;
}

export function getSuspicionPresentation(result: Pick<AnalysisResult, "status" | "confidence">): SuspicionPresentation {
  if (result.status === "credible") {
    const score = Math.max(6, 100 - result.confidence);
    return {
      level: "not_suspicious",
      label: "Not Suspicious",
      score,
      tone: "calm",
      interpretation:
        "Few misinformation-associated signals were detected. This does not guarantee that the content is accurate.",
    };
  }

  if (result.status === "not_credible" && result.confidence >= 80) {
    return {
      level: "highly_suspicious",
      label: "Suspicious",
      score: result.confidence,
      tone: "severe",
      interpretation:
        "Several strong misinformation-associated signals were detected. Verify through official sources before sharing.",
    };
  }

  return {
    level: "suspicious",
    label: "Likely Suspicious",
    score: result.confidence,
    tone: "warning",
    interpretation:
      "Some misinformation-associated signals were detected. The result needs source checking and human review.",
  };
}

export function getStatusLabel(status: AnalysisStatus, confidence = 0) {
  return getSuspicionPresentation({ status, confidence }).label;
}
