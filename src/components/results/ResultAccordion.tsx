import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function ResultAccordion({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <Card className="p-0 shadow-none">
      <details className="group" open={defaultOpen}>
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
          <span>
            <span className="block font-semibold">{title}</span>
            {description ? <span className="block text-sm text-muted">{description}</span> : null}
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 ease-out group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-border/70 p-5">{children}</div>
      </details>
    </Card>
  );
}
