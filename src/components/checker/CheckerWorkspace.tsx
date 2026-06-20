"use client";

import { useEffect, useState } from "react";
import { AnalysisProgress } from "@/components/checker/AnalysisProgress";
import { TextAnalysisEditor } from "@/components/checker/TextAnalysisEditor";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { analyzeText } from "@/lib/api/analysis";
import type { AnalysisResult } from "@/types/analysis";

export function CheckerWorkspace({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);

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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
      <div className="space-y-4">
        {!online ? <ErrorState title="Offline mode" description="You appear to be offline. Mock history remains visible, but analysis may not complete." /> : null}
        <TextAnalysisEditor value={text} onChange={setText} onAnalyze={() => void runAnalysis()} loading={loading} />
      </div>
      <div className="space-y-4">
        {loading ? <AnalysisProgress /> : null}
        {error ? <ErrorState title="Analysis could not finish" description={error} /> : null}
        {!loading && !error && result ? (
          <AnalysisResults result={result} />
        ) : !loading && !error ? (
          <EmptyState title="Results will appear here" description="Add at least 50 characters, then run an analysis to see confidence, highlights, and model explanations." />
        ) : null}
      </div>
    </div>
  );
}
