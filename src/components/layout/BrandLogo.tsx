import Link from "next/link";
import { brand } from "@/config/brand";

export function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-white">ts</span>
      <span>
        <span className="block text-lg font-bold leading-5 tracking-tight">{brand.name}</span>
        <span className="block text-xs text-muted">{brand.descriptor}</span>
      </span>
    </Link>
  );
}
