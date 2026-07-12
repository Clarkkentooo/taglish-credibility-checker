"use client";

import { useEffect, useState } from "react";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { ErrorState } from "@/components/states/ErrorState";
import { Skeleton } from "@/components/states/Skeleton";
import { getAnalysis } from "@/lib/api/analysis";
import type { AnalysisResult } from "@/types/analysis";

export function HistoryDetailClient({ id }: { id: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalysis(id)
      .then(setAnalysis)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Analysis not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !analysis) {
    return <ErrorState title="Analysis unavailable" description={error || "Analysis not found."} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">Saved suspiciousness check</p>
        <h1 className="mt-2 text-3xl font-bold">{analysis.title}</h1>
      </div>
      <AnalysisResults result={analysis} />
    </div>
  );
}
