import { AlertTriangle, SearchCheck, ShieldQuestion } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getSuspicionPresentation, type SuspicionPresentation } from "@/lib/presentation";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

const iconMap: Record<SuspicionPresentation["tone"], typeof SearchCheck> = {
  calm: SearchCheck,
  warning: ShieldQuestion,
  severe: AlertTriangle,
};

const toneClass: Record<SuspicionPresentation["tone"], string> = {
  calm: "text-credible bg-credible/10",
  warning: "text-caution bg-caution/10",
  severe: "text-critical bg-critical/10",
};

const headerClass: Record<SuspicionPresentation["level"], string> = {
  not_suspicious: "border-credible/15 bg-gradient-to-r from-[#d7ecff] via-[#eef7ff] to-white text-ink",
  suspicious: "border-caution/20 bg-gradient-to-r from-[#ffe69a] via-[#fff4ce] to-white text-ink",
  highly_suspicious: "border-critical/20 bg-gradient-to-r from-[#ffd6d8] via-[#ffebec] to-white text-ink",
};

const illustrationMap: Record<SuspicionPresentation["level"], { src: string; alt: string }> = {
  not_suspicious: {
    src: "/result-illustrations/not-suspicious.svg",
    alt: "Not suspicious result illustration",
  },
  suspicious: {
    src: "/result-illustrations/likely-suspicious.svg",
    alt: "Likely suspicious result illustration",
  },
  highly_suspicious: {
    src: "/result-illustrations/suspicious.svg",
    alt: "Suspicious result illustration",
  },
};

export function ResultSummaryCard({ result, variant = "default" }: { result: AnalysisResult; variant?: "default" | "plain" }) {
  const presentation = getSuspicionPresentation(result);
  const Icon = iconMap[presentation.tone];
  const illustration = illustrationMap[presentation.level];
  const lean = presentation.level === "not_suspicious" ? "not suspicious" : presentation.level === "highly_suspicious" ? "suspicious" : "likely suspicious";

  return (
    <Card className="overflow-hidden bg-white p-0 shadow-none backdrop-blur-0">
      <div className={variant === "plain" ? "border-b border-border bg-white px-5 py-5 text-ink" : `relative min-h-28 overflow-hidden border-b px-5 py-4 ${headerClass[presentation.level]}`}>
        <div className="relative z-10 grid min-h-20 grid-cols-[minmax(0,1fr)_150px] items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Suspicion result</p>
            <h2 className="mt-2 text-[27px] font-black leading-[0.98] tracking-[0.015em]">{presentation.label}</h2>
          </div>
          <div className="relative h-24 min-w-0">
            <span className="absolute left-0 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap text-xs font-semibold leading-none text-ink">{presentation.score}% score</span>
            {variant === "plain" ? null : <Image src={illustration.src} alt={illustration.alt} width={176} height={144} className="absolute bottom-[-10px] right-[-10px] h-36 w-36 object-contain object-right-bottom" />}
          </div>
        </div>
      </div>
      <div className="p-5">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[presentation.tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted">Automated estimate</p>
          <p className="mt-2 text-sm text-muted">{presentation.interpretation}</p>
          <p className="mt-2 text-sm text-muted">{result.summary}</p>
        </div>
      </div>
      <div className="mt-5">
        <ConfidenceIndicator score={presentation.score} tone={presentation.tone} />
      </div>
      <dl className="mt-5 grid gap-3 rounded-xl border border-border bg-canvas p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Model agreement</dt>
          <dd className="font-semibold">{result.modelAgreement} of 3 models lean {lean}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Analysis ID</dt>
          <dd className="font-mono text-xs">{result.id}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Timestamp</dt>
          <dd>{formatDate(result.createdAt)}</dd>
        </div>
      </dl>
      </div>
    </Card>
  );
}
