const steps = ["Checking language patterns", "Comparing model predictions", "Preparing explanations"];

export function AnalysisProgress() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5" role="status" aria-live="polite">
      <p className="font-semibold">Analyzing credibility signals...</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm text-muted">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
