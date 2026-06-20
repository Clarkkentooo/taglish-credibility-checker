"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HighlightedSpan } from "@/types/analysis";
import { HighlightLegend } from "./HighlightLegend";

const label: Record<HighlightedSpan["category"], string> = {
  political_entity: "Political entity",
  election_term: "Election term",
  taglish_expression: "Informal Taglish expression",
  linguistic_pattern: "Linguistic pattern",
};

export function HighlightedText({ text, spans }: { text: string; spans: HighlightedSpan[] }) {
  const [active, setActive] = useState<HighlightedSpan | null>(spans[0] ?? null);
  const ordered = [...spans].sort((a, b) => a.start - b.start);

  const built = ordered.reduce<{ cursor: number; nodes: ReactNode[] }>(
    (acc, span) => ({
      cursor: span.end,
      nodes: [
        ...acc.nodes,
        text.slice(acc.cursor, span.start),
      <button
        key={span.id}
        type="button"
        onClick={() => setActive(span)}
        className={cn(
          "mx-0.5 rounded-md border px-1.5 py-0.5 text-left underline decoration-2 underline-offset-4 transition",
          span.direction === "credible"
            ? "border-credible/35 bg-credible/10 decoration-credible"
            : "border-critical/35 bg-critical/10 decoration-critical",
        )}
        aria-label={`${span.text}, ${label[span.category]}, ${Math.round(span.weight * 100)} percent relative weight`}
      >
        {span.text}
      </button>,
      ],
    }),
    { cursor: 0, nodes: [] },
  );

  const parts = [...built.nodes, text.slice(built.cursor)];

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Highlighted source text</h2>
          <p className="mt-1 text-sm text-muted">Select a marked phrase to review why it influenced the estimate.</p>
        </div>
        <HighlightLegend />
      </div>
      <div className="mt-5 rounded-xl border border-border bg-canvas p-4 leading-8">{parts}</div>
      {active ? (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4" aria-live="polite">
          <p className="text-sm font-semibold">{active.text}</p>
          <p className="mt-1 text-sm text-muted">
            {label[active.category]} · {active.direction === "credible" ? "Leans credible" : "Leans not credible"} · Relative weight{" "}
            {Math.round(active.weight * 100)}%
          </p>
          <p className="mt-3 text-sm">{active.explanation}</p>
        </div>
      ) : null}
    </Card>
  );
}
