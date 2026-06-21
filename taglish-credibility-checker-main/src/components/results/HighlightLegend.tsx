import { Badge } from "@/components/ui/badge";

const items = [
  ["Political entity", "Candidate or election body reference"],
  ["Election term", "Voting or result language"],
  ["Informal Taglish expression", "Conversational marker"],
  ["Linguistic pattern", "Tone, urgency, or claim pattern"],
];

export function HighlightLegend() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Highlight legend">
      {items.map(([label, description]) => (
        <Badge key={label} title={description}>
          {label}
        </Badge>
      ))}
    </div>
  );
}
