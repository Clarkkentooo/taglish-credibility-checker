"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    // Auto sign in after sign up
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6 shadow-glow">
        <BrandLogo />
        <h1 className="mt-8 text-3xl font-black tracking-[0.015em]">Create an account</h1>
        <p className="mt-2 text-sm text-muted">Sign up to save and view your analysis history.</p>
        {success ? (
          <p className="mt-6 rounded-[1rem] bg-canvas p-4 text-sm text-primary">
            Account created. Redirecting to your dashboard…
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-sm font-medium">
              Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4"
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4"
                placeholder="At least 6 characters"
              />
            </label>
            {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}
        <p className="mt-5 text-sm text-muted">
          Already have an account? <Link href="/sign-in" className="font-semibold text-primary">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
