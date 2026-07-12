import Link from "next/link";
import Image from "next/image";
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
    <div className="mx-auto w-full space-y-6 lg:w-1/2">
      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-xl sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Demo dashboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.015em]">Welcome back.</h1>
          <p className="mt-2 text-muted">Start a new suspiciousness check or revisit recent mock results.</p>
        </div>
        <ButtonLink href="/dashboard/checker" className="w-full whitespace-nowrap sm:w-auto">New analysis</ButtonLink>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {dashboardStats.map((stat) => (
          <Card key={stat.key} className="p-5">
            <span className="block h-14 w-14 text-primary" aria-hidden="true">
              <Image src={stat.iconSrc} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
            </span>
            <p className="mt-4 text-sm text-muted">{stat.label} - Demo data</p>
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
        <div className="grid gap-3">
          {mockAnalyses.slice(0, 4).map((analysis) => (
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
      </section>
    </div>
  );
}
