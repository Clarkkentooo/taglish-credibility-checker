import { BrainCircuit, Languages, SearchCheck, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { brand } from "@/config/brand";

const sections = [
  {
    icon: SearchCheck,
    title: "What the checker does",
    text: "It estimates whether Taglish election-related text contains suspicious or not-suspicious language signals. It does not verify every factual claim.",
  },
  {
    icon: Languages,
    title: "What Taglish means here",
    text: "Taglish refers to Filipino-English mixed language commonly used in social posts, captions, and discussion threads.",
  },
  {
    icon: BrainCircuit,
    title: "Deployed transformer model",
    text: "The live prototype uses a fine-tuned XLM-RoBERTa model, with RoBERTa-Tagalog and mBERT included for comparative scoring.",
  },
  {
    icon: ShieldQuestion,
    title: "Why explanations matter",
    text: "Influential phrases help users see which entities, election terms, Taglish expressions, or linguistic patterns shaped the estimate.",
  },
];

export default function DashboardMethodsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Methods</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Model methodology</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
          {brand.name} is designed as a screening interface for a Taglish credibility-classification research workflow.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="min-h-44 p-4 sm:p-5">
              <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold leading-tight sm:mt-4 sm:text-xl">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{section.text}</p>
            </Card>
          );
        })}
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-xl font-semibold leading-tight sm:text-2xl">How the estimate should be read</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {["Input text", "Model classification", "Influential phrases"].map((step, index) => (
            <div key={step} className="rounded-[1.25rem] bg-white/55 p-3 sm:p-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-semibold text-white sm:h-9 sm:w-9 sm:text-base">{index + 1}</span>
              <h3 className="mt-3 font-semibold leading-tight sm:mt-4">{step}</h3>
              <p className="mt-2 text-sm text-muted">
                {index === 0
                  ? "The user supplies Taglish election-related text."
                  : index === 1
                    ? "The primary model returns a confidence score and suspiciousness classification."
                    : "Highlights explain what language features influenced the result."}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-xl font-semibold leading-tight sm:text-2xl">Role of Groq LLaMA 3.3</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          Groq LLaMA 3.3 acts as a verdict interpreter. The classification decision and suspicion confidence scores are determined by the transformer models; Groq is used to generate plain-language explanations and summarize language patterns.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-caution/25 bg-white/65 p-4 shadow-glow backdrop-blur sm:p-6">
        <h2 className="text-xl font-semibold leading-tight sm:text-2xl">Limitations</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          Model influence is not proof of factual causation. False positives and false negatives are possible, especially with short text, satire, rapidly changing election information, or missing context. Human verification and reliable sources remain necessary.
        </p>
      </section>
    </div>
  );
}
