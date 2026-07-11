import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Privacy</p>
        <h1 className="mt-3 text-5xl font-black tracking-[0.015em]">Privacy and demo data</h1>
        <Card className="mt-8 p-6">
          <p className="text-muted">
            This frontend is currently in mock mode. Text, uploaded-file states, feedback, and history are demo interactions and are not connected to a production backend from this interface.
          </p>
          <p className="mt-4 text-muted">
            A final privacy policy should be written once backend storage, authentication, analytics, retention, and deletion behavior are implemented and reviewed.
          </p>
        </Card>
      </main>
    </div>
  );
}
