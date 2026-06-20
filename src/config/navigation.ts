import { BarChart3, BookOpen, Bookmark, Clock3, Home, Sparkles } from "lucide-react";

export const marketingNavigation = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
];

export const appNavigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/checker", label: "New analysis", icon: Sparkles },
  { href: "/dashboard/history", label: "History", icon: Clock3 },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/methodology", label: "Methods", icon: BookOpen },
];

export const dashboardStats = [
  { label: "Total analyses", key: "total", icon: BarChart3 },
  { label: "Not suspicious", key: "credible", icon: BarChart3 },
  { label: "Highly suspicious", key: "notCredible", icon: BarChart3 },
  { label: "Suspicious", key: "uncertain", icon: BarChart3 },
] as const;
