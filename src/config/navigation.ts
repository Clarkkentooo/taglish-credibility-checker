import { BarChart3, BookOpen, Clock3, Home, Settings, Sparkles } from "lucide-react";

export const marketingNavigation = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
];

export const appNavigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/checker", label: "New analysis", icon: Sparkles },
  { href: "/dashboard/history", label: "History", icon: Clock3 },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const dashboardStats = [
  { label: "Total analyses", key: "total", icon: BarChart3 },
  { label: "Likely credible", key: "credible", icon: BarChart3 },
  { label: "Likely not credible", key: "notCredible", icon: BarChart3 },
  { label: "Needs context", key: "uncertain", icon: BarChart3 },
] as const;
