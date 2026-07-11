import { getStatusLabel } from "@/lib/presentation";
import { excerpt, formatNumericDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { HistoryActionsMenu } from "./HistoryActionsMenu";

export function HistoryTable({ analyses, onDelete, onRename }: { analyses: AnalysisResult[]; onDelete: (id: string) => void; onRename: (id: string) => void }) {
  return (
    <div className="hidden overflow-x-auto rounded-[1.5rem] border border-white/70 bg-white/70 shadow-sm backdrop-blur md:block">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-white/45 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Analysis</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {analyses.map((analysis) => (
            <tr key={analysis.id}>
              <td className="px-4 py-4">
                <p className="font-semibold">{analysis.title}</p>
                <p className="mt-1 text-muted">{excerpt(analysis.sourceText, 90)}</p>
              </td>
              <td className="px-4 py-4">{getStatusLabel(analysis.status, analysis.confidence)}</td>
              <td className="px-4 py-4">{analysis.confidence}%</td>
              <td className="px-4 py-4">{formatNumericDate(analysis.createdAt)}</td>
              <td className="px-4 py-4">
                <HistoryActionsMenu analysis={analysis} onDelete={onDelete} onRename={onRename} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
