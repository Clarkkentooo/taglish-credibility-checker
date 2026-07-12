"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { dashboardStats } from "@/config/navigation";
import { EmptyState } from "@/components/states/EmptyState";
import { Skeleton } from "@/components/states/Skeleton";
import { getAnalyses } from "@/lib/api/analysis";
import { getStatusLabel } from "@/lib/presentation";
import { getSessionMode, type SessionMode } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SessionMode>("user");

  useEffect(() => {
    setMode(getSessionMode());
    getAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    total: analyses.length,
    credible: analyses.filter((item) => item.status === "credible").length,
    notCredible: analyses.filter((item) => item.status === "not_credible").length,
    uncertain: analyses.filter((item) => item.status === "uncertain").length,
  }), [analyses]);

  if (loading) {
    return (
      <div className="mx-auto w-full space-y-6 lg:w-1/2">
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 lg:w-1/2">
      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-xl sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{mode === "demo" ? "Demo dashboard" : "Local dashboard"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.015em]">Welcome back.</h1>
          <p className="mt-2 text-muted">
            {mode === "demo" ? "Start a new suspiciousness check or revisit seeded demo results." : "Start a new suspiciousness check or revisit analyses saved in this browser."}
          </p>
        </div>
        <ButtonLink href="/dashboard/checker" className="w-full whitespace-nowrap sm:w-auto">New analysis</ButtonLink>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {dashboardStats.map((stat) => (
          <Card key={stat.key} className="p-5">
            <span className="block h-14 w-14 text-primary" aria-hidden="true">
              <Image src={stat.iconSrc} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
            </span>
            <p className="mt-4 text-sm text-muted">{stat.label} - {mode === "demo" ? "Demo data" : "Local data"}</p>
            <p className="mt-2 text-3xl font-bold">{counts[stat.key]}</p>
          </Card>
        ))}
      </section>
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Recent analyses</h2>
          <Link href="/dashboard/history" className="text-sm font-semibold text-primary hover:text-ink">
            View history
          </Link>
        </div>
        {analyses.length === 0 ? (
          <EmptyState title="No analyses yet" description="Run a text or image check to add results to your local history." />
        ) : (
          <div className="grid gap-3">
            {analyses.slice(0, 4).map((analysis) => (
            <Link key={analysis.id} href={`/dashboard/history/${analysis.id}`} className="rounded-[1.25rem] border border-white/70 bg-white/68 p-4 shadow-sm transition hover:bg-white/90">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{analysis.title}</p>
                  <p className="text-sm text-muted">{formatDate(analysis.createdAt)}</p>
                </div>
                <span className="text-sm font-semibold">{getStatusLabel(analysis.status, analysis.confidence)} - signal score</span>
              </div>
            </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
