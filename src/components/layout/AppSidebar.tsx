"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("hidden min-h-screen shrink-0 border-r border-white/70 bg-white/72 p-4 backdrop-blur-xl transition-all lg:block", collapsed ? "w-24" : "w-64")}>
      <div className="flex items-start justify-between gap-2">
        <BrandLogo href="/dashboard" compact={collapsed} />
        <Button
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="min-h-10 px-3"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
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
                "flex min-h-11 items-center gap-3 rounded-full px-3 text-sm font-medium text-muted transition hover:bg-white/80 hover:text-ink",
                collapsed && "justify-center px-0",
                active && "bg-ink text-white shadow-sm",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
