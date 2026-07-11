"use client";

import Link from "next/link";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/analysis";

export function HistoryActionsMenu({
  analysis,
  onDelete,
  onRename,
}: {
  analysis: AnalysisResult;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative inline-flex justify-end">
      <Button
        type="button"
        variant="ghost"
        className="min-h-10 w-10 px-0"
        aria-label={`Open actions for ${analysis.title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </Button>
      {open ? (
        <>
          <button type="button" aria-label="Close actions" className="fixed inset-0 z-20 cursor-default" onClick={close} />
          <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-[1rem] border border-border bg-white p-1 text-sm shadow-sm">
            <Link
              href={`/dashboard/history/${analysis.id}`}
              className="flex min-h-10 items-center gap-2 rounded-[0.75rem] px-3 font-semibold transition-colors hover:bg-canvas"
              onClick={close}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open analysis
            </Link>
            {onRename ? (
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold transition-colors hover:bg-canvas"
                onClick={() => {
                  close();
                  onRename(analysis.id);
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Rename
              </button>
            ) : null}
            <button
              type="button"
              className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold transition-colors hover:bg-canvas"
              onClick={() => {
                close();
                void navigator.clipboard?.writeText(analysis.sourceText);
              }}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicate text
            </button>
            <button
              type="button"
              className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold text-critical transition-colors hover:bg-critical/10"
              onClick={() => {
                close();
                onDelete(analysis.id);
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
