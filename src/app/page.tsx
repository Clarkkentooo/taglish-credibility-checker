import { ArrowRight, BookOpen, CheckCircle2, FileSearch, ShieldQuestion, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { brand } from "@/config/brand";
import { mockAnalyses } from "@/lib/mocks/analyses";

const valueItems = [
  ["Taglish-aware", "Designed around Filipino-English election-content patterns."],
  ["Explainable signals", "Shows the phrases and categories that influenced the estimate."],
  ["Model comparison", "Keeps RoBERTa-Tagalog, mBERT, and XLM-RoBERTa visible but secondary."],
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <MarketingHeader />
      <main>
        <section className="relative mx-auto grid max-w-7xl gap-8 bg-white px-4 pb-16 pt-6 sm:px-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:px-8 lg:pt-10">
          <div className="flex flex-col justify-start lg:pt-10">
            <p className="w-fit rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">{brand.tagline}</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.95] tracking-[0.015em] sm:text-6xl lg:text-7xl">Check Taglish content before you share.</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">See misinformation-associated signals, influential phrases, and model confidence in seconds. Built for calm, explainable review of election-related posts.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/checker">
                Check suspiciousness <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/methodology" variant="secondary">
                View methodology
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[560px] lg:min-h-[640px]">
            <Card className="absolute right-0 top-4 w-[88%] rotate-2 p-5 shadow-soft">
              <p className="text-sm font-semibold">Source content</p>
              <p className="mt-3 rounded-[1rem] border border-border bg-white p-4 text-sm leading-7 text-muted shadow-inner">{brand.sampleText}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full bg-canvas px-3 py-1">Text input</span>
                <span className="rounded-full bg-canvas px-3 py-1">27 words</span>
                <span className="rounded-full bg-canvas px-3 py-1">Mock OCR ready</span>
              </div>
            </Card>
            <div className="absolute left-0 top-36 w-[90%] rotate-[-1.5deg]">
              <ResultSummaryCard result={mockAnalyses[0]} variant="plain" />
            </div>
          </div>
        </section>
        <section className="border-y border-white/70 bg-white/45 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
            {valueItems.map(([title, text]) => (
              <div key={title} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-credible" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Paste, analyze, understand</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [Sparkles, "Paste or upload", "Start with text, document, or image material in an OCR-ready flow."],
              [FileSearch, "Review signals", "See a confidence estimate, highlighted phrases, and factor categories."],
              [BookOpen, "Verify responsibly", "Use the result as a screening aid, then check reliable sources."],
            ].map(([Icon, title, text]) => (
              <Card key={String(title)} className="p-5">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{String(title)}</h3>
                <p className="mt-2 text-sm text-muted">{String(text)}</p>
              </Card>
            ))}
          </div>
        </section>
        <section className="bg-white/35 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              ["Everyday users", "Check a post, caption, or thread excerpt before sharing it."],
              ["Educators and students", "Discuss media literacy with explainable, non-accusatory examples."],
              ["Journalists and researchers", "Screen language signals while keeping verification standards human-led."],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </Card>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <ShieldQuestion className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold">Use results responsibly</h2>
          <p className="mt-4 text-muted">{brand.disclaimer}</p>
          <ButtonLink href="/checker" className="mt-8">Start a new check</ButtonLink>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted">{brand.name} · {brand.descriptor}</footer>
    </div>
  );
}
