"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HighlightedSpan } from "@/types/analysis";
import { highlightLabel } from "./highlightLabels";

function renderSuspicionText(text: string, direction: HighlightedSpan["direction"]) {
  const parts = text.split(/(suspicious|suspicion)/gi);
  return parts.map((part, index) =>
    /^(suspicious|suspicion)$/i.test(part) ? (
      <span key={`${part}-${index}`} className={cn("underline decoration-2 underline-offset-2", direction === "credible" ? "decoration-credible" : "decoration-critical")}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function InlineHighlightedText({
  text,
  spans,
  className,
  onChange,
}: {
  text: string;
  spans: HighlightedSpan[];
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState<HighlightedSpan | null>(null);
  const [hovered, setHovered] = useState<HighlightedSpan | null>(null);
  const active = hovered ?? selected;
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
            onClick={() => setSelected((value) => (value?.id === span.id ? null : span))}
            onMouseEnter={() => setHovered(span)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(span)}
            onBlur={() => setHovered(null)}
            onKeyDown={(event) => {
              if (!onChange || (event.key !== "Backspace" && event.key !== "Delete")) return;
              event.preventDefault();
              setSelected(null);
              setHovered(null);
              onChange(`${text.slice(0, span.start)}${text.slice(span.end)}`);
            }}
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
  }, [onChange, spans, text]);

  return (
    <div className={className}>
      <div className="leading-8">{parts}</div>
      {active ? (
        <div className="mt-4 rounded-[1.1rem] border border-border bg-white/75 p-4" role="dialog" aria-label={`Explanation for ${active.text}`}>
          <p className="text-base font-semibold">{active.text}</p>
          <p className="mt-1 text-[13px] text-muted">
            {highlightLabel[active.category]} - {active.direction === "credible" ? "Reduces " : "Raises "}
            <span className={cn("underline decoration-2 underline-offset-2", active.direction === "credible" ? "decoration-credible" : "decoration-critical")}>suspicious</span>
            {" "}signal - Relative weight{" "}
            {Math.round(active.weight * 100)}%
          </p>
          <p className="mt-3 text-sm">{renderSuspicionText(active.explanation, active.direction)}</p>
        </div>
      ) : null}
    </div>
  );
}
