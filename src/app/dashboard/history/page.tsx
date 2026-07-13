import { HistoryClient } from "@/components/history/HistoryClient";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-bold">Analysis history</h1>
        <p className="mt-2 text-muted">Search, filter, rename, duplicate, and delete demo suspiciousness checks.</p>
      </div>
      <HistoryClient />
    </div>
  );
}
