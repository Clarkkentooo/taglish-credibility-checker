import { HistoryClient } from "@/components/history/HistoryClient";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Analysis history</h1>
        <p className="mt-2 text-muted">Search, filter, rename, duplicate, and delete demo analyses.</p>
      </div>
      <HistoryClient />
    </div>
  );
}
