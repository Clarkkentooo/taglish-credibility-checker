import { BrandLogo } from "@/components/layout/BrandLogo";
import { ButtonLink } from "@/components/ui/button";
import { marketingNavigation } from "@/config/navigation";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex" aria-label="Main navigation">
          {marketingNavigation.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/sign-in" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/checker">Open checker</ButtonLink>
        </div>
      </div>
    </header>
  );
}
