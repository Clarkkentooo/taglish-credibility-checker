"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <BrandLogo href="/dashboard" />
        <Button variant="secondary" aria-label="Open menu" onClick={() => setOpen(true)} className="px-3">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/35" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="ml-auto h-full w-[min(88vw,360px)] bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <BrandLogo href="/dashboard" />
              <Button variant="ghost" aria-label="Close menu" onClick={() => setOpen(false)} className="px-3">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 space-y-2">
              {appNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted",
                      pathname === item.href && "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
