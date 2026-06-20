import { Card } from "@/components/ui/card";
import type { HighlightedSpan } from "@/types/analysis";
import { HighlightLegend } from "./HighlightLegend";
import { InlineHighlightedText } from "./InlineHighlightedText";

export function HighlightedText({ text, spans }: { text: string; spans: HighlightedSpan[] }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Highlighted source text</h2>
          <p className="mt-1 text-sm text-muted">Select a marked phrase to review why it influenced the estimate.</p>
        </div>
        <HighlightLegend />
      </div>
      <InlineHighlightedText text={text} spans={spans} className="mt-5 rounded-[1.25rem] border border-white/80 bg-white/55 p-4 shadow-inner" />
    </Card>
  );
}
