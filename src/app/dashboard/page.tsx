import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { dashboardStats } from "@/config/navigation";
import { mockAnalyses } from "@/lib/mocks/analyses";
import { getStatusLabel } from "@/lib/presentation";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const counts = {
    total: mockAnalyses.length,
    credible: mockAnalyses.filter((item) => item.status === "credible").length,
    notCredible: mockAnalyses.filter((item) => item.status === "not_credible").length,
    uncertain: mockAnalyses.filter((item) => item.status === "uncertain").length,
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-soft backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Demo dashboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Welcome back.</h1>
          <p className="mt-2 text-muted">Start a new suspiciousness check or revisit recent mock results.</p>
        </div>
        <ButtonLink href="/dashboard/checker">New analysis</ButtonLink>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key} className="p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-4 text-sm text-muted">{stat.label} · Demo data</p>
              <p className="mt-2 text-3xl font-bold">{counts[stat.key]}</p>
            </Card>
          );
        })}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent analyses</h2>
          <Link href="/dashboard/history" className="text-sm font-semibold text-primary">View history</Link>
        </div>
        <div className="grid gap-3">
          {mockAnalyses.slice(0, 4).map((analysis) => (
            <Link key={analysis.id} href={`/dashboard/history/${analysis.id}`} className="rounded-[1.25rem] border border-white/70 bg-white/68 p-4 shadow-sm transition hover:bg-white/90">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{analysis.title}</p>
                  <p className="text-sm text-muted">{formatDate(analysis.createdAt)}</p>
                </div>
                <span className="text-sm font-semibold">{getStatusLabel(analysis.status, analysis.confidence)} · signal score</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
