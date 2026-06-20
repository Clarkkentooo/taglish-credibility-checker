import { cn } from "@/lib/utils";
import type { AnalysisStatus } from "@/types/analysis";

const statusColor: Record<AnalysisStatus, string> = {
  credible: "bg-credible",
  not_credible: "bg-critical",
  uncertain: "bg-caution",
};

export function ConfidenceIndicator({ confidence, status }: { confidence: number; status: AnalysisStatus }) {
  return (
    <div aria-label={`Confidence ${confidence} percent`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={confidence}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-muted">Confidence</span>
        <span className="font-semibold">{confidence}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full", statusColor[status])} style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}
