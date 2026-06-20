import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { statusCopy } from "@/config/brand";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult, AnalysisStatus } from "@/types/analysis";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

const iconMap: Record<AnalysisStatus, typeof ShieldCheck> = {
  credible: ShieldCheck,
  not_credible: ShieldAlert,
  uncertain: ShieldQuestion,
};

const tone: Record<AnalysisStatus, string> = {
  credible: "text-credible bg-credible/10",
  not_credible: "text-critical bg-critical/10",
  uncertain: "text-caution bg-caution/10",
};

export function ResultSummaryCard({ result }: { result: AnalysisResult }) {
  const Icon = iconMap[result.status];
  const lean = result.status === "credible" ? "credible" : result.status === "not_credible" ? "not credible" : "mixed";

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone[result.status]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted">Automated estimate</p>
          <h2 className="text-2xl font-bold">{statusCopy[result.status]}</h2>
          <p className="mt-2 text-sm text-muted">{result.summary}</p>
        </div>
      </div>
      <div className="mt-5">
        <ConfidenceIndicator confidence={result.confidence} status={result.status} />
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
    </Card>
  );
}
