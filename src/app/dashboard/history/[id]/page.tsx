import { HistoryDetailClient } from "@/components/history/HistoryDetailClient";

export default function SavedAnalysisPage({ params }: { params: { id: string } }) {
  return <HistoryDetailClient id={params.id} />;
}
