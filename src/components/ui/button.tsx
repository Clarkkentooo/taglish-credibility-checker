import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary/90",
  secondary: "border border-border bg-surface text-ink hover:bg-primary/5",
  ghost: "text-ink hover:bg-primary/8",
  danger: "border border-critical/30 bg-critical/10 text-critical hover:bg-critical/15",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
