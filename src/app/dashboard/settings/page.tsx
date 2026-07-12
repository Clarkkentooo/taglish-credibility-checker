"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { clearLocalHistory } from "@/lib/local-history";
import { getSessionMode, setSessionMode, type SessionMode } from "@/lib/session";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("system");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<SessionMode>("user");

  useEffect(() => {
    setMode(getSessionMode());
  }, []);

  function deleteHistory() {
    if (mode === "user") clearLocalHistory();
    setNotice(mode === "demo" ? "Demo history cleared for this session." : "Local history deleted from this browser.");
  }

  function logOut() {
    setSessionMode("user");
    router.push("/sign-in");
  }

  return (
    <div className="mx-auto w-full space-y-5 lg:w-1/2">
      <div>
        <h1 className="text-4xl font-black tracking-[0.015em]">Settings</h1>
        <p className="mt-2 text-muted">Profile, appearance, language, and local data controls.</p>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Profile</h2>
          <Badge>{mode === "demo" ? "Demo profile" : "Local profile"}</Badge>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Display name
            <input className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" value={mode === "demo" ? "Demo reviewer" : "Local reviewer"} readOnly />
          </label>
          <label className="text-sm font-medium">
            Email
            <input className="mt-2 min-h-11 w-full rounded-full border border-white/80 bg-white/65 px-4" value={mode === "demo" ? "demo@tsek.local" : "local@tsek.local"} readOnly />
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
        <p className="mt-2 text-muted">{mode === "demo" ? "Demo history is seeded for presentation and resets with the session." : "Local history is stored in this browser only."}</p>
        <Button className="mt-4" variant="danger" onClick={deleteHistory}>{mode === "demo" ? "Clear demo history" : "Delete local history"}</Button>
        {notice ? <p className="mt-3 text-sm text-credible" role="status">{notice}</p> : null}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="mt-2 text-muted">End this local session and return to the sign-in page.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={logOut}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
