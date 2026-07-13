"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-white">
      <Image
        src="/caps-illus/signin-illustration.svg"
        alt=""
        width={1600}
        height={1200}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-26dvh] left-[-14vw] h-[58dvh] w-[128vw] max-w-none object-cover object-bottom sm:bottom-[-24dvh] sm:h-[64dvh] lg:bottom-auto lg:left-[-2.5vw] lg:top-[-8vh] lg:h-[120vh] lg:w-[69vw] lg:object-cover lg:object-left-top"
      />
      <div className="relative z-10 flex h-full items-center justify-center px-4 py-4 sm:px-6 lg:justify-end lg:px-[10vw]">
        <Card className="w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border-white/75 bg-white p-5 shadow-soft sm:p-8 lg:max-w-[30rem]">
          <BrandLogo />
          <h1 className="mt-6 text-4xl font-black tracking-[0.015em] sm:mt-8">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            Welcome back. Sign in to access your analysis history.
          </p>
          <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-full border border-transparent bg-white/40 px-4 text-base text-ink transition placeholder:text-muted/55 focus:border-primary focus:bg-white"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-full border border-transparent bg-white/40 px-4 text-base text-ink transition placeholder:text-muted/55 focus:border-primary focus:bg-white"
                placeholder="Password"
              />
            </label>
            {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}
            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-muted">
            New here? <Link href="/sign-up" className="font-semibold text-primary">Create an account</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
