"use client";

import { PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("hidden min-h-screen shrink-0 border-r border-border/70 bg-white p-4 transition-[width] duration-300 ease-out lg:block", collapsed ? "w-24" : "w-64")}>
      <div className={cn("flex items-start gap-2", collapsed ? "justify-center" : "justify-between")}>
        {collapsed ? (
          <button
            type="button"
            aria-label="Expand sidebar"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={() => setCollapsed(false)}
          >
            <span
              className="block h-9 w-9 bg-ink"
              aria-hidden="true"
              style={{
                WebkitMask: "url(/main-logo.svg) center / contain no-repeat",
                mask: "url(/main-logo.svg) center / contain no-repeat",
              }}
            />
            <span className="sr-only">{brand.name}</span>
          </button>
        ) : (
          <>
            <BrandLogo href="/dashboard" />
            <Button
              variant="ghost"
              aria-label="Collapse sidebar"
              className="min-h-10 px-3 transition-transform duration-300 ease-out hover:-translate-x-0.5"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {!collapsed ? <Badge className="mt-5">Mock mode · Demo data</Badge> : null}
      <nav className="mt-6 space-y-1" aria-label="Dashboard navigation">
        {appNavigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 overflow-hidden rounded-full px-3 text-sm font-medium text-muted transition-colors duration-200 ease-out hover:bg-primary/8 hover:text-ink",
                active && "bg-ink text-white shadow-sm hover:bg-ink hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={cn("whitespace-nowrap transition-all duration-300 ease-out", collapsed ? "w-0 translate-x-2 opacity-0" : "w-auto translate-x-0 opacity-100")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
