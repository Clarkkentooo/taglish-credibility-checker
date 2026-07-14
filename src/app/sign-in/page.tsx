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

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
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
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => void handleGoogleSignIn()}
          >
            <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
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
