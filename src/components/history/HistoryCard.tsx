"use client";

import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { statusCopy } from "@/config/brand";
import { excerpt, formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

export function HistoryCard({ analysis, onDelete }: { analysis: AnalysisResult; onDelete: (id: string) => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{analysis.title}</h3>
          <p className="mt-1 text-sm text-muted">{formatDate(analysis.createdAt)}</p>
        </div>
        <span className="rounded-full border border-border px-2 py-1 text-xs font-medium">{statusCopy[analysis.status]}</span>
      </div>
      <p className="mt-3 text-sm text-muted">{excerpt(analysis.sourceText)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold" href={`/dashboard/history/${analysis.id}`}>
          Open
        </Link>
        <Button variant="ghost" className="min-h-10 px-3" onClick={() => void navigator.clipboard?.writeText(analysis.sourceText)}>
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Duplicate text
        </Button>
        <Button variant="danger" className="min-h-10 px-3" onClick={() => onDelete(analysis.id)}>
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
