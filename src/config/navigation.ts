import { BookOpen, Bookmark, Clock3, Home, Sparkles } from "lucide-react";

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
  { label: "Total analyses", key: "total", iconSrc: "/caps-illus/dashboard/total-analyses.svg" },
  { label: "Not suspicious", key: "credible", iconSrc: "/caps-illus/dashboard/not-suspicious.svg" },
  { label: "Highly suspicious", key: "notCredible", iconSrc: "/caps-illus/dashboard/highly-suspicious.svg" },
  { label: "Suspicious", key: "uncertain", iconSrc: "/caps-illus/dashboard/suspicious.svg" },
] as const;
