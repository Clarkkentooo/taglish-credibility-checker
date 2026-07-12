import { FactorList } from "@/components/results/FactorList";
import { FeedbackDialog } from "@/components/results/FeedbackDialog";
import { HighlightedText } from "@/components/results/HighlightedText";
import { ModelComparison } from "@/components/results/ModelComparison";
import { ResponsibleUseNotice } from "@/components/results/ResponsibleUseNotice";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { ResultAccordion } from "@/components/results/ResultAccordion";
import { VerifyNextSteps } from "@/components/results/VerifyNextSteps";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisResults({ result, summaryVariant = "default" }: { result: AnalysisResult; summaryVariant?: "default" | "plain" }) {
  return (
    <section className="space-y-4" aria-label="Analysis results">
      <ResultSummaryCard result={result} variant={summaryVariant} />
      <ResultAccordion title="Responsible use" description="What this estimate can and cannot do">
        <ResponsibleUseNotice />
      </ResultAccordion>
      <ResultAccordion title="Highlighted source text" description="Click phrases to inspect explanations" defaultOpen>
        <HighlightedText text={result.sourceText} spans={result.highlightedSpans} />
      </ResultAccordion>
      <ResultAccordion title="Key factors" description="Signals that influenced the score">
        <FactorList spans={result.highlightedSpans} />
      </ResultAccordion>
      <ResultAccordion title="Advanced model comparison" description="Compare the model scores">
        <ModelComparison scores={result.modelScores} />
      </ResultAccordion>
      <ResultAccordion title="Verify next steps" description="Actions to take before sharing">
        <VerifyNextSteps />
      </ResultAccordion>
      <ResultAccordion title="Feedback" description="Tell us whether this result helped">
        <FeedbackDialog analysisId={result.id} />
      </ResultAccordion>
    </section>
  );
}
