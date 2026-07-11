"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HighlightedSpan } from "@/types/analysis";
import { HighlightLegend } from "./HighlightLegend";
import { InlineHighlightedText } from "./InlineHighlightedText";
import { highlightLabel } from "./highlightLabels";

export function HighlightedText({ text, spans }: { text: string; spans: HighlightedSpan[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <Card className="w-full p-3 text-left shadow-none sm:p-5">
      <InlineHighlightedText text={text} spans={spans} className="w-full rounded-[1.25rem] border border-white/80 bg-white/55 p-4 text-left shadow-inner max-sm:-mx-1 max-sm:w-[calc(100%+0.5rem)]" />
      <div className="mt-4 flex w-full flex-col items-start gap-3">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-muted">Select a marked phrase to review why it influenced the estimate.</p>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 shrink-0 px-3 py-1.5 text-xs"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
          >
            <ListChecks className="mr-2 h-4 w-4" aria-hidden="true" />
            {showAll ? "Hide all results" : "See all results"}
          </Button>
        </div>
        <HighlightLegend />
      </div>
      {showAll ? (
        <div className="mt-4 grid gap-3" aria-label="All highlighted explanations">
          {spans.map((span) => (
            <article key={span.id} className="rounded-[1rem] border border-border/70 bg-white/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{span.text}</h3>
                <span className="rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">
                  {Math.round(span.weight * 100)}% weight
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {highlightLabel[span.category]} - {span.direction === "credible" ? "Reduces suspicion" : "Raises suspicion"}
              </p>
              <p className="mt-2 text-sm text-muted">{span.explanation}</p>
            </article>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
