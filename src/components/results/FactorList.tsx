import { Landmark, MessageSquareQuote, Vote, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { HighlightedSpan } from "@/types/analysis";

const iconMap: Record<HighlightedSpan["category"], typeof Landmark> = {
  political_entity: Landmark,
  election_term: Vote,
  taglish_expression: MessageSquareQuote,
  linguistic_pattern: Wand2,
};

const label: Record<HighlightedSpan["category"], string> = {
  political_entity: "Political entity",
  election_term: "Election term",
  taglish_expression: "Informal Taglish expression",
  linguistic_pattern: "Linguistic pattern",
};

export function FactorList({ spans }: { spans: HighlightedSpan[] }) {
  return (
    <Card className="w-full p-4 text-left shadow-none sm:p-5">
      <div className="w-full space-y-3">
        {spans.map((span) => {
          const Icon = iconMap[span.category];
          return (
            <article key={span.id} className="w-full rounded-[1.25rem] border border-white/80 bg-white/45 p-4">
              <div className="flex w-full items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="font-semibold">{span.text}</h3>
                  <p className="text-xs font-medium text-muted">
                    {label[span.category]} - {span.direction === "credible" ? "Reduces suspicion" : "Raises suspicion"} - Impact{" "}
                    {Math.round(span.weight * 100)}%
                  </p>
                  <p className="mt-2 text-sm text-muted">{span.explanation}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
