import type { HighlightedSpan } from "@/types/analysis";

export const highlightLabel: Record<HighlightedSpan["category"], string> = {
  political_entity: "Political entity",
  election_term: "Election term",
  taglish_expression: "Informal Taglish expression",
  linguistic_pattern: "Linguistic pattern",
};
