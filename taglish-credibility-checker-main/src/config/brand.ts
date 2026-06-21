export const brand = {
  name: "tsek.",
  descriptor: "Taglish Credibility Checker",
  tagline: "Think before you share.",
  description: "Modern frontend for an explainable Taglish election-content credibility checker.",
  disclaimer:
    "This result is an automated estimate of misinformation-associated language signals. It does not verify every factual claim or replace reliable sources and human fact-checking.",
  sampleText:
    "Candidate A said the local election office already posted official results, pero sabi ng viral thread may hidden ballots daw sa precinct. Check muna natin before sharing.",
};

export const statusCopy = {
  credible: "Not Suspicious",
  not_credible: "Highly Suspicious",
  uncertain: "Suspicious",
} as const;
