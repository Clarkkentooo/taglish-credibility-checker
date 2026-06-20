import { ExternalLink, FileCheck2, Share2, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: FileCheck2,
    title: "Check official records",
    text: "Compare election-result claims with official election office updates.",
  },
  {
    icon: UserCheck,
    title: "Look for source context",
    text: "Confirm who posted it, when it was posted, and whether evidence is shown.",
  },
  {
    icon: Share2,
    title: "Pause before sharing",
    text: "Treat suspicious scores as a prompt to verify, not as a final verdict.",
  },
];

export function VerifyNextSteps() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Verify next steps</h2>
          <p className="mt-1 text-sm text-muted">Use the analysis as a screening aid before taking action.</p>
        </div>
        <ExternalLink className="h-5 w-5 text-muted" aria-hidden="true" />
      </div>
      <div className="mt-4 space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex gap-3 rounded-xl border border-border bg-canvas p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-caution/10 text-caution">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted">{step.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
