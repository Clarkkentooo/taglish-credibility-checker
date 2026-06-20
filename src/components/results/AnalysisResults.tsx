import { FactorList } from "@/components/results/FactorList";
import { FeedbackDialog } from "@/components/results/FeedbackDialog";
import { HighlightedText } from "@/components/results/HighlightedText";
import { ModelComparison } from "@/components/results/ModelComparison";
import { ResponsibleUseNotice } from "@/components/results/ResponsibleUseNotice";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { VerifyNextSteps } from "@/components/results/VerifyNextSteps";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisResults({ result, summaryVariant = "default" }: { result: AnalysisResult; summaryVariant?: "default" | "plain" }) {
  return (
    <section className="space-y-4" aria-label="Analysis results">
      <ResultSummaryCard result={result} variant={summaryVariant} />
      <ResponsibleUseNotice />
      <HighlightedText text={result.sourceText} spans={result.highlightedSpans} />
      <FactorList spans={result.highlightedSpans} />
      <ModelComparison scores={result.modelScores} />
      <VerifyNextSteps />
      <FeedbackDialog analysisId={result.id} />
    </section>
  );
}
