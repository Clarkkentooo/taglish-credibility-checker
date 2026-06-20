import { AlertTriangle, SearchCheck, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSuspicionPresentation, type SuspicionPresentation } from "@/lib/presentation";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

const iconMap: Record<SuspicionPresentation["tone"], typeof SearchCheck> = {
  calm: SearchCheck,
  warning: ShieldQuestion,
  severe: AlertTriangle,
};

const toneClass: Record<SuspicionPresentation["tone"], string> = {
  calm: "text-credible bg-credible/10",
  warning: "text-caution bg-caution/10",
  severe: "text-critical bg-critical/10",
};

export function ResultSummaryCard({ result }: { result: AnalysisResult }) {
  const presentation = getSuspicionPresentation(result);
  const Icon = iconMap[presentation.tone];
  const lean = presentation.level === "not_suspicious" ? "not suspicious" : presentation.level === "highly_suspicious" ? "highly suspicious" : "suspicious";

  return (
    <Card className="overflow-hidden p-0 shadow-glow">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(255,126,91,0.42),transparent_18rem),linear-gradient(135deg,#171321,#2a2039)] px-5 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Suspicion result</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black tracking-[-0.04em]">{presentation.label}</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">{presentation.score}% score</span>
        </div>
      </div>
      <div className="p-5">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[presentation.tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted">Automated estimate</p>
          <p className="mt-2 text-sm text-muted">{presentation.interpretation}</p>
          <p className="mt-2 text-sm text-muted">{result.summary}</p>
        </div>
      </div>
      <div className="mt-5">
        <ConfidenceIndicator score={presentation.score} tone={presentation.tone} />
      </div>
      <dl className="mt-5 grid gap-3 rounded-xl border border-border bg-canvas p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Model agreement</dt>
          <dd className="font-semibold">{result.modelAgreement} of 3 models lean {lean}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Analysis ID</dt>
          <dd className="font-mono text-xs">{result.id}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Timestamp</dt>
          <dd>{formatDate(result.createdAt)}</dd>
        </div>
      </dl>
      </div>
    </Card>
  );
}
