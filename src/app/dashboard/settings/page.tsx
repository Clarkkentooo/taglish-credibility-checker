"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("system");
  const [notice, setNotice] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setDisplayName(
          (data.user.user_metadata?.full_name as string | undefined) ??
          data.user.email?.split("@")[0] ?? ""
        );
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <div className="mx-auto w-full space-y-5 lg:w-1/2">
      <div>
        <h1 className="text-4xl font-black tracking-[0.015em]">Settings</h1>
        <p className="mt-2 text-muted">Profile, appearance, and account controls.</p>
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Profile</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Display name
            <input
              className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              readOnly
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4"
              value={email}
              readOnly
            />
          </label>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <label className="mt-4 block text-sm font-medium">
          Theme preference
          <select
            className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4 md:w-72"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
          </select>
        </label>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Language</h2>
        <p className="mt-2 text-muted">English interface is available now. Filipino interface is planned for a later milestone.</p>
      </Card>
      <Card className="border-critical/30 p-5">
        <h2 className="text-xl font-semibold">History and data</h2>
        <p className="mt-2 text-muted">Deletion controls will be available once persistent storage is connected.</p>
        <Button className="mt-4" variant="danger" onClick={() => setNotice("Feature coming soon.")}>Delete history</Button>
        {notice ? <p className="mt-3 text-sm text-credible" role="status">{notice}</p> : null}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="mt-2 text-muted">Sign out of your account.</p>
        <Button onClick={() => void handleLogout()} variant="secondary" className="mt-4">
          Sign out
        </Button>
      </Card>
    </div>
  );
}
