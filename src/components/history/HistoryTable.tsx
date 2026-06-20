"use client";

import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/lib/presentation";
import { excerpt, formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

export function HistoryTable({ analyses, onDelete, onRename }: { analyses: AnalysisResult[]; onDelete: (id: string) => void; onRename: (id: string) => void }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
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
              <td className="px-4 py-4">{analysis.confidence}% model confidence</td>
              <td className="px-4 py-4">{formatDate(analysis.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 font-semibold" href={`/dashboard/history/${analysis.id}`}>
                    Open
                  </Link>
                  <Button variant="ghost" className="min-h-10 px-3" onClick={() => onRename(analysis.id)} aria-label={`Rename ${analysis.title}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="min-h-10 px-3" onClick={() => void navigator.clipboard?.writeText(analysis.sourceText)} aria-label={`Duplicate text from ${analysis.title}`}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" className="min-h-10 px-3" onClick={() => onDelete(analysis.id)} aria-label={`Delete ${analysis.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
