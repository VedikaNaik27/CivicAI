"use client";

import { useRouter } from "next/navigation";
import { AuthProvider, DEMO_USERS, useAuth } from "@/lib/auth";
import { Radio, ShieldCheck, Building2, User } from "lucide-react";

const ROLE_ICON = { admin: ShieldCheck, department: Building2, citizen: User } as const;

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
            <Radio className="h-5 w-5 text-white" />
          </span>
          <h1 className="mt-3 font-display text-[20px] font-bold text-ink-900">Sign in to CivicAI</h1>
          <p className="mt-1 text-[13px] text-ink-500">Demo authentication — choose an account to continue.</p>
        </div>
        <div className="space-y-2">
          {DEMO_USERS.map((u) => {
            const Icon = ROLE_ICON[u.role];
            return (
              <button
                key={u.email}
                onClick={() => {
                  login(u.email);
                  router.push("/dashboard");
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left hover:bg-navy-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink-900">{u.name}</span>
                  <span className="block text-[11.5px] text-ink-500">{u.email}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[11.5px] text-ink-400">
          Demo accounts only — no real credentials are required or stored.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginInner />
    </AuthProvider>
  );
}
