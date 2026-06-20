import Link from "next/link";
import { ArrowRight, BrainCircuit, Languages, SearchCheck, ShieldQuestion } from "lucide-react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Card } from "@/components/ui/card";
import { brand } from "@/config/brand";

const sections = [
  {
    icon: SearchCheck,
    title: "What the checker does",
    text: "It estimates whether Taglish election-related text contains credibility or lower-credibility language signals. It does not verify every factual claim.",
  },
  {
    icon: Languages,
    title: "What Taglish means here",
    text: "Taglish refers to Filipino-English mixed language commonly used in social posts, captions, and discussion threads.",
  },
  {
    icon: BrainCircuit,
    title: "Compared transformer models",
    text: "The research context compares RoBERTa-Tagalog, mBERT, and XLM-RoBERTa to inspect consistency across model families.",
  },
  {
    icon: ShieldQuestion,
    title: "Why explanations matter",
    text: "Influential phrases help users see which entities, election terms, Taglish expressions, or linguistic patterns shaped the estimate.",
  },
];

export default function MethodologyPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Methodology</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.04em]">Plain-language model explanation</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          {brand.name} is designed as a screening interface for a Taglish credibility-classification research workflow. The frontend currently uses realistic mock data.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="p-5">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
                <p className="mt-2 text-muted">{section.text}</p>
              </Card>
            );
          })}
        </div>
        <section className="mt-10 rounded-[1.75rem] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold">How the estimate should be read</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {["Input text", "Model comparison", "Influential phrases"].map((step, index) => (
              <div key={step} className="rounded-[1.25rem] bg-white/55 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-semibold text-white">{index + 1}</span>
                <h3 className="mt-4 font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-muted">
                  {index === 0
                    ? "The user supplies Taglish election-related text."
                    : index === 1
                      ? "Mock probabilities show how the three model families lean."
                      : "Highlights explain what language features influenced the result."}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-[1.75rem] border border-caution/25 bg-white/65 p-6 shadow-glow backdrop-blur">
          <h2 className="text-2xl font-semibold">Limitations</h2>
          <p className="mt-3 text-muted">
            Correlation or model influence is not proof of factual causation. False positives and false negatives are possible, especially with short text, satire, rapidly changing election information, or missing context. Human verification and reliable sources remain necessary.
          </p>
          <p className="mt-3 text-muted">In mock mode, analysis history and feedback are demonstration data only and are not sent to a real backend.</p>
        </section>
        <Link href="/checker" className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Try the checker <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}
