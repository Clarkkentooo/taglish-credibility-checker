import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6 shadow-glow">
        <BrandLogo />
        <h1 className="mt-8 text-3xl font-black tracking-[-0.04em]">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Authentication is mocked for this frontend milestone.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input type="email" className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input type="password" className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="••••••••" />
          </label>
          <ButtonLink href="/dashboard" className="w-full">Continue to demo dashboard</ButtonLink>
        </form>
        <p className="mt-5 text-sm text-muted">
          New here? <Link href="/sign-up" className="font-semibold text-primary">Create a demo account</Link>
        </p>
      </Card>
    </main>
  );
}
