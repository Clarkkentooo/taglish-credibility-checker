"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();

  function handleSignUp(event?: React.FormEvent) {
    if (event) event.preventDefault();
    localStorage.setItem("tsektxt_logged_in", "true");
    router.push("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Card className="w-full max-w-md justify-self-center p-6 shadow-glow">
          <BrandLogo />
          <h1 className="mt-8 text-3xl font-black tracking-[0.015em]">Create a demo account</h1>
          <p id="signup-demo-note" className="mt-2 text-sm text-muted">
            Saved analyses are mocked until backend authentication is connected. This form opens the demo dashboard.
          </p>
          <Button onClick={handleSignUp} variant="secondary" className="mt-6 w-full gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-ink">G</span>
            Sign up with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
            <span className="h-px flex-1 bg-border" />
            Or use email
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleSignUp} className="space-y-4" aria-describedby="signup-demo-note">
            <label className="block text-sm font-medium">
              Name
              <input autoComplete="name" required className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="Demo reviewer" />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input type="email" autoComplete="email" required className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" placeholder="demo@tsek.local" />
            </label>
            <Button type="submit" className="w-full">Start demo</Button>
          </form>
          <p className="mt-5 text-sm text-muted">
            Already have an account? <Link href="/sign-in" className="font-semibold text-primary hover:text-ink">Sign in</Link>
          </p>
        </Card>
        <Card className="hidden overflow-hidden p-0 shadow-soft lg:block">
          <Image src="/caps-illus/sign-up.svg" alt="Person reviewing social content illustration" width={1254} height={1254} className="h-[30rem] w-full object-contain p-8" priority />
        </Card>
      </div>
    </main>
  );
}
