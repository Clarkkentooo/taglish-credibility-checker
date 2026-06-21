"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { sendFeedback } from "@/lib/api/analysis";
import type { AnalysisStatus } from "@/types/analysis";

const schema = z.object({
  correctedLabel: z.union([z.enum(["credible", "not_credible", "uncertain"]), z.literal("")]).optional(),
  note: z.string().max(500).optional(),
});

type FeedbackForm = z.infer<typeof schema>;

export function FeedbackDialog({ analysisId }: { analysisId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, formState } = useForm<FeedbackForm>({ resolver: zodResolver(schema) });

  async function quickFeedback(helpful: boolean) {
    await sendFeedback(analysisId, { helpful });
    setMessage(helpful ? "Thanks. Marked as helpful in mock mode." : "Thanks. Marked as not helpful in mock mode.");
  }

  async function onSubmit(values: FeedbackForm) {
    await sendFeedback(analysisId, {
      correctedLabel: values.correctedLabel === "" ? undefined : (values.correctedLabel as AnalysisStatus | undefined),
      note: values.note,
    });
    setMessage("Report submitted in mock mode.");
    reset();
    setOpen(false);
  }

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-white p-4">
      <h2 className="font-semibold">Was this result useful?</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void quickFeedback(true)}>Helpful</Button>
        <Button variant="secondary" onClick={() => void quickFeedback(false)}>Not helpful</Button>
        <Button variant="ghost" onClick={() => setOpen(true)}>Report an incorrect result</Button>
      </div>
      {message ? <p className="mt-3 text-sm text-credible" role="status">{message}</p> : null}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-[1.5rem] bg-white/95 p-5 shadow-soft backdrop-blur">
            <h3 id="feedback-title" className="text-lg font-semibold">Report an incorrect result</h3>
            <label className="mt-4 block text-sm font-medium" htmlFor="correctedLabel">Optional corrected label</label>
            <select id="correctedLabel" className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3" {...register("correctedLabel")}>
              <option value="">No label selected</option>
              <option value="credible">Likely credible</option>
              <option value="not_credible">Likely not credible</option>
              <option value="uncertain">Needs more context</option>
            </select>
            <label className="mt-4 block text-sm font-medium" htmlFor="note">Optional note</label>
            <textarea id="note" rows={4} className="mt-2 w-full rounded-lg border border-border bg-surface p-3" {...register("note")} />
            {formState.errors.note ? <p className="mt-2 text-sm text-critical">{formState.errors.note.message}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Submit report</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
