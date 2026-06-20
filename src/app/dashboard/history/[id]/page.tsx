import { notFound } from "next/navigation";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { mockAnalyses } from "@/lib/mocks/analyses";

export function generateStaticParams() {
  return mockAnalyses.map((analysis) => ({ id: analysis.id }));
}

export default function SavedAnalysisPage({ params }: { params: { id: string } }) {
  const analysis = mockAnalyses.find((item) => item.id === params.id);
  if (!analysis) notFound();
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
