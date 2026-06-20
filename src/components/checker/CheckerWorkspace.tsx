"use client";

import { useEffect, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { AnalysisProgress } from "@/components/checker/AnalysisProgress";
import { TextAnalysisEditor } from "@/components/checker/TextAnalysisEditor";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { analyzeText } from "@/lib/api/analysis";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

export function CheckerWorkspace({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.setTimeout(update, 0);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  async function runAnalysis() {
    setError("");
    setLoading(true);
    try {
      const next = await analyzeText(text);
      setResult(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("relative grid gap-5", resultsOpen ? "xl:grid-cols-[minmax(560px,1fr)_420px]" : "xl:grid-cols-1")}>
      <div className="absolute right-0 top-0 z-10">
        <Button
          variant="secondary"
          onClick={() => setResultsOpen((value) => !value)}
          aria-expanded={resultsOpen}
          aria-controls="analysis-result-sidebar"
          aria-label={resultsOpen ? "Hide result panel" : "Show result panel"}
          className="min-h-10 w-10 px-0"
          title={resultsOpen ? "Hide result panel" : "Show result panel"}
        >
          {resultsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-4 pt-14 xl:pt-0">
        {!online ? <ErrorState title="Offline mode" description="You appear to be offline. Mock history remains visible, but analysis may not complete." /> : null}
        <TextAnalysisEditor value={text} onChange={setText} onAnalyze={() => void runAnalysis()} loading={loading} result={result} />
      </div>
      {resultsOpen ? (
        <aside id="analysis-result-sidebar" className="result-scrollbar space-y-4 xl:-mr-8 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-auto xl:border-l xl:border-border/70 xl:bg-white xl:px-4 xl:py-5" aria-label="Suspicion result panel">
          {loading ? <AnalysisProgress /> : null}
          {error ? <ErrorState title="Analysis could not finish" description={error} /> : null}
          {!loading && !error && result ? (
            <AnalysisResults result={result} />
          ) : !loading && !error ? (
            <EmptyState title="Add something to generate results" description="Paste at least 50 characters, then run an analysis to see the score, highlights, and explanations." />
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
