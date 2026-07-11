import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Card className="hidden overflow-hidden p-0 shadow-soft lg:block">
          <Image src="/caps-illus/sign-in.svg" alt="Reviewer holding notes illustration" width={1254} height={1254} className="h-[30rem] w-full object-contain p-8" priority />
        </Card>
      <Card className="w-full max-w-md justify-self-center p-6 shadow-glow">
        <BrandLogo />
        <h1 className="mt-8 text-3xl font-black tracking-[0.015em]">Sign in</h1>
        <p id="auth-demo-note" className="mt-2 text-sm text-muted">
          Authentication is mocked for this frontend milestone. Use any email/password to enter the demo dashboard.
        </p>
        <ButtonLink href="/dashboard" variant="secondary" className="mt-6 w-full gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-ink">G</span>
          Sign in with Google
        </ButtonLink>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
          <span className="h-px flex-1 bg-border" />
          Or use email
          <span className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-4" aria-describedby="auth-demo-note">
          <label className="block text-sm font-medium">
            Email
            <input type="email" autoComplete="email" className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="demo@tsek.local" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input type="password" autoComplete="current-password" className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="Any password" />
          </label>
          <ButtonLink href="/dashboard" className="w-full">Continue to demo dashboard</ButtonLink>
        </form>
        <p className="mt-5 text-sm text-muted">
          New here? <Link href="/sign-up" className="font-semibold text-primary hover:text-ink">Create a demo account</Link>
        </p>
      </Card>
      </div>
    </main>
  );
}
