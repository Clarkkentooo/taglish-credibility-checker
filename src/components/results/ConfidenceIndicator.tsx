import { cn } from "@/lib/utils";
import type { SuspicionPresentation } from "@/lib/presentation";

const toneColor: Record<SuspicionPresentation["tone"], string> = {
  calm: "bg-credible",
  warning: "bg-caution",
  severe: "bg-critical",
};

export function ConfidenceIndicator({ score, tone }: { score: number; tone: SuspicionPresentation["tone"] }) {
  return (
    <div aria-label={`Suspicion score ${score} percent`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-muted">Suspicion score</span>
        <span className="font-semibold">{score}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full", toneColor[tone])} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
