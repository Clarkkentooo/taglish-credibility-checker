import type { ModelScore } from "@/types/analysis";

export function ModelComparison({ scores }: { scores: ModelScore[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Compare the verdict from the fine-tuned XLM-RoBERTa model against Groq language analysis.</p>
      {scores.map((score) => (
        <div key={score.model}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{score.model}</span>
            <span className="text-muted">{Math.round(score.notCredibleProbability * 100)}% suspicious</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="bg-credible" style={{ width: `${score.credibleProbability * 100}%` }} />
            <div className="bg-critical" style={{ width: `${score.notCredibleProbability * 100}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>Not suspicious — {Math.round(score.credibleProbability * 100)}%</span>
            <span>Suspicious — {Math.round(score.notCredibleProbability * 100)}%</span>
          </div>
        </div>
      ))}
      <p className="rounded-[1rem] bg-canvas p-3 text-sm text-muted">
        Results should be verified with reliable sources and human judgment.
      </p>
    </div>
  );
}
