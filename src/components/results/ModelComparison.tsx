import type { ModelScore } from "@/types/analysis";

export function ModelComparison({ scores }: { scores: ModelScore[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Model agreement improves consistency, but does not prove that content is true or false.</p>
      {scores.map((score) => (
        <div key={score.model}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{score.model}</span>
            <span className="text-muted">{Math.round(score.notCredibleProbability * 100)}% suspicious</span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="bg-credible" style={{ width: `${score.credibleProbability * 100}%` }} />
            <div className="bg-critical" style={{ width: `${score.notCredibleProbability * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="rounded-[1rem] bg-canvas p-3 text-sm text-muted">
        These probabilities come from the demo model contract. They should be compared with reliable sources and human judgment.
      </p>
    </div>
  );
}
