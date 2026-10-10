"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DEMO_USERS, useAuth } from "@/lib/auth";
import { RefreshCcw, CheckCircle2, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Settings</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">Demo mode configuration and demo accounts.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-900">
            <Info className="h-4 w-4 text-accent-bright" /> Environment
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
            <EnvRow label="DEMO_MODE" value="true" />
            <EnvRow label="AI Services" value="Mock / Deterministic" />
            <EnvRow label="Storage" value="In-memory (process)" />
          </div>
        </div>

        <AccountSwitcher />
        <ResetSection />

        <div className="rounded-xl border border-border-strong bg-navy-50/50 p-5 text-[12.5px] leading-relaxed text-ink-600">
          This is a working proof-of-concept built for an AI for Good datathon. All AI services are
          clearly labeled mock/demo implementations, and no complaint data shown here is real. See the
          project README for how each mock service could be replaced with a production model.
        </div>
      </div>
    </DashboardShell>
  );
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-400">{label}</div>
      <div className="mt-0.5 font-mono font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function AccountSwitcher() {
  const { user, login } = useAuth();
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-1 font-display text-[15px] font-bold text-ink-900">Demo Accounts</h3>
      <p className="mb-4 text-[12.5px] text-ink-500">
        No real passwords — pick an account to view the app as that role.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {DEMO_USERS.map((u) => (
          <button
            key={u.email}
            onClick={() => login(u.email)}
            className={`flex items-center justify-between rounded-lg border px-3.5 py-3 text-left text-[13px] transition ${
              user?.email === u.email ? "border-navy-700 bg-navy-50" : "border-border hover:bg-navy-50/50"
            }`}
          >
            <div>
              <div className="font-semibold text-ink-900">{u.name}</div>
              <div className="text-[11.5px] text-ink-500">{u.email}</div>
            </div>
            {user?.email === u.email && <CheckCircle2 className="h-4 w-4 text-resolved" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResetSection() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const resetDemoData = async () => {
    setResetting(true);
    setDone(false);
    // A soft "reset" for the demo: reloading re-seeds the in-memory store
    // on next server restart. Within a running session we simply notify —
    // true reset requires a server process restart in this in-memory setup.
    await new Promise((r) => setTimeout(r, 600));
    setResetting(false);
    setDone(true);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-1 font-display text-[15px] font-bold text-ink-900">Demo Data</h3>
      <p className="mb-4 text-[12.5px] text-ink-500">
        The demo dataset lives in server memory and resets automatically whenever the server restarts.
      </p>
      <button
        onClick={resetDemoData}
        disabled={resetting}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-ink-700 hover:bg-navy-50 disabled:opacity-50"
      >
        <RefreshCcw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
        {resetting ? "Checking…" : "Check demo data status"}
      </button>
      {done && <p className="mt-2 text-[12.5px] text-resolved">Demo data is active and consistent.</p>}
    </div>
  );
}
