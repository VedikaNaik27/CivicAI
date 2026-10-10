"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Menu, Plus, Search, User } from "lucide-react";
import { DEMO_USERS, useAuth } from "@/lib/auth";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, login } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-ink-500 hover:bg-navy-50 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-navy-50/60 px-3 py-2 text-sm text-ink-500 sm:flex">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search complaints, wards, teams…"
          className="w-full bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/report"
          className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-navy-800 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Report Issue</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg border border-border p-2 text-ink-500 hover:bg-navy-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-critical" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg animate-fade-in">
              <div className="px-2 py-1.5 text-xs font-semibold text-ink-500">Recent notifications</div>
              {[
                "3 new high-severity complaints in Ward 151",
                "Duplicate cluster detected: Pothole, BTM Layout",
                "CIV-1019 marked resolved by Road Team",
              ].map((n, i) => (
                <div key={i} className="rounded-lg px-2 py-2 text-[13px] text-ink-700 hover:bg-navy-50">
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border py-1.5 pl-1.5 pr-2.5 hover:bg-navy-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-700">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[12.5px] font-semibold text-ink-900">
                {user?.name ?? "Demo User"}
              </span>
              <span className="block text-[10.5px] capitalize text-ink-500">{user?.role ?? "citizen"}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-lg animate-fade-in">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                Switch demo account
              </div>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => {
                    login(u.email);
                    setUserMenuOpen(false);
                  }}
                  className={`flex w-full flex-col rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-navy-50 ${
                    user?.email === u.email ? "bg-navy-50" : ""
                  }`}
                >
                  <span className="font-medium text-ink-900">{u.name}</span>
                  <span className="text-[11px] text-ink-500">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
