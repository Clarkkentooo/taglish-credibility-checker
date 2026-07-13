"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("system");
  const [notice, setNotice] = useState("");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("tsektxt_logged_in");
    router.push("/sign-in");
  }

  return (
    <div className="mx-auto w-full space-y-5 lg:w-1/2">
      <div>
        <h1 className="text-4xl font-black tracking-[0.015em]">Settings</h1>
        <p className="mt-2 text-muted">Profile, appearance, language, and demo data controls.</p>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Profile</h2>
          <Badge>Mock profile</Badge>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Display name
            <input className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" defaultValue="Demo reviewer" />
          </label>
          <label className="text-sm font-medium">
            Email
            <input className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" defaultValue="demo@tsek.local" />
          </label>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <label className="mt-4 block text-sm font-medium">
          Theme preference
          <select className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4 md:w-72" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark ready</option>
          </select>
        </label>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Language</h2>
        <p className="mt-2 text-muted">English interface is available now. Filipino interface copy is planned for a later milestone.</p>
      </Card>
      <Card className="border-critical/30 p-5">
        <h2 className="text-xl font-semibold">History and data</h2>
        <p className="mt-2 text-muted">Deletion controls are mocked until persistent backend storage exists.</p>
        <Button className="mt-4" variant="danger" onClick={() => setNotice("Demo history deletion queued in mock mode.")}>Delete demo history</Button>
        {notice ? <p className="mt-3 text-sm text-credible" role="status">{notice}</p> : null}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="mt-2 text-muted">End the mocked session and return to the sign-in page.</p>
        <Button onClick={handleLogout} variant="secondary" className="mt-4">
          Log out
        </Button>
      </Card>
    </div>
  );
}
