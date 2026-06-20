"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ModelScore } from "@/types/analysis";

export function ModelComparison({ scores }: { scores: ModelScore[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-5">
      <button type="button" className="flex w-full min-h-11 items-center justify-between text-left" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>
          <span className="block text-lg font-semibold">Advanced model comparison</span>
          <span className="block text-sm text-muted">Model agreement improves consistency, but does not prove that content is true or false.</span>
        </span>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? (
        <div className="mt-4 space-y-4">
          {scores.map((score) => (
            <div key={score.model}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{score.model}</span>
                <span className="text-muted">{Math.round(score.notCredibleProbability * 100)}% suspicious</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div className="bg-credible" style={{ width: `${score.credibleProbability * 100}%` }} />
                <div className="bg-critical" style={{ width: `${score.notCredibleProbability * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="rounded-lg bg-canvas p-3 text-sm text-muted">
            These probabilities come from the demo model contract. They should be compared with reliable sources and human judgment.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
