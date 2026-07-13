import type { ModelScore } from "@/types/analysis";

export function ModelComparison({ scores }: { scores: ModelScore[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model agreement helps assess consistency. Under our methodology, the <strong>XLM-RoBERTa</strong> model is the primary decision maker, while the other two models are comparative showcases.
      </p>
      {scores.map((score) => {
        const isPrimary = score.model.includes("XLM-RoBERTa");
        return (
          <div key={score.model} className={isPrimary ? "rounded-xl border border-primary/20 bg-primary/[0.01] p-3 -mx-3" : "py-1"}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-sm">
              <span className="font-semibold flex flex-wrap items-center gap-1.5">
                {score.model}
                {isPrimary ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                    Primary / Decision Maker
                  </span>
                ) : (
                  <span className="rounded-full bg-canvas border border-border px-2 py-0.5 text-[9px] font-medium text-muted uppercase tracking-wide">
                    Comparative
                  </span>
                )}
              </span>
              <span className="text-muted font-semibold">{Math.round(score.notCredibleProbability * 100)}% suspicious</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <div className="bg-credible" style={{ width: `${score.credibleProbability * 100}%` }} />
              <div className="bg-critical" style={{ width: `${score.notCredibleProbability * 100}%` }} />
            </div>
          </div>
        );
      })}
      <p className="rounded-[1rem] bg-canvas p-3 text-sm text-muted">
        These probabilities are computed directly by the fine-tuned TsekTxt classifiers. They should be evaluated alongside reliable sources and human verification.
      </p>
    </div>
  );
}
