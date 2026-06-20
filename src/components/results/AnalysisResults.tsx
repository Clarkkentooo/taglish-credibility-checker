import { FactorList } from "@/components/results/FactorList";
import { FeedbackDialog } from "@/components/results/FeedbackDialog";
import { HighlightedText } from "@/components/results/HighlightedText";
import { ModelComparison } from "@/components/results/ModelComparison";
import { ResponsibleUseNotice } from "@/components/results/ResponsibleUseNotice";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  return (
    <section className="space-y-4" aria-label="Analysis results">
      <ResultSummaryCard result={result} />
      <ResponsibleUseNotice />
      <HighlightedText text={result.sourceText} spans={result.highlightedSpans} />
      <FactorList spans={result.highlightedSpans} />
      <ModelComparison scores={result.modelScores} />
      <FeedbackDialog analysisId={result.id} />
    </section>
  );
}
