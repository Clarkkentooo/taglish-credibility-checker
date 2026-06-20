"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HighlightedSpan } from "@/types/analysis";
import { highlightLabel } from "./highlightLabels";

export function InlineHighlightedText({
  text,
  spans,
  className,
}: {
  text: string;
  spans: HighlightedSpan[];
  className?: string;
}) {
  const [active, setActive] = useState<HighlightedSpan | null>(spans[0] ?? null);
  const parts = useMemo(() => {
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
              "mx-0.5 rounded-md border px-1.5 py-0.5 text-left underline decoration-2 underline-offset-4 transition-colors hover:bg-white focus-visible:outline-primary",
              span.direction === "credible"
                ? "border-credible/35 bg-credible/10 decoration-credible"
                : "border-critical/35 bg-critical/10 decoration-critical",
            )}
            aria-label={`${span.text}, ${highlightLabel[span.category]}, ${Math.round(span.weight * 100)} percent relative weight`}
          >
            {span.text}
          </button>,
        ],
      }),
      { cursor: 0, nodes: [] },
    );

    return [...built.nodes, text.slice(built.cursor)];
  }, [spans, text]);

  return (
    <div className={className}>
      <div className="leading-8">{parts}</div>
      {active ? (
        <div className="mt-4 rounded-[1.1rem] border border-border bg-white/75 p-4 text-sm" role="dialog" aria-label={`Explanation for ${active.text}`}>
          <p className="font-semibold">{active.text}</p>
          <p className="mt-1 text-muted">
            {highlightLabel[active.category]} - {active.direction === "credible" ? "Reduces suspicion" : "Raises suspicion"} - Relative weight{" "}
            {Math.round(active.weight * 100)}%
          </p>
          <p className="mt-3">{active.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
