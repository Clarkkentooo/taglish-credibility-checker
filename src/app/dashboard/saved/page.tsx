import { HistoryClient } from "@/components/history/HistoryClient";

export default function SavedPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Saved analyses</h1>
        <p className="mt-2 text-muted">Revisit bookmarked or important demo suspiciousness checks.</p>
      </div>
      <HistoryClient />
    </div>
  );
}
