"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SystemStatusBar } from "@/components/dashboard/SystemStatusBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { DepartmentWorkloadTable } from "@/components/dashboard/DepartmentWorkloadTable";
import { RecentComplaintsTable } from "@/components/dashboard/RecentComplaintsTable";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { ComplaintMapClient } from "@/components/maps/ComplaintMapClient";
import { Complaint } from "@/types";
import { computeKPIs } from "@/lib/aggregate";
import {
  FileStack,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Route,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints))
      .catch(() => setComplaints([]));
  }, []);

  const kpis = complaints ? computeKPIs(complaints) : null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">
              CivicAI Command Center
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              AI-powered civic intelligence for faster, safer and more transparent issue resolution.
            </p>
          </div>
          <Link
            href="/report"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-800"
          >
            + Report Issue
          </Link>
        </div>

        <SystemStatusBar />

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Total Reports"
            value={kpis ? kpis.total.toLocaleString("en-IN") : "—"}
            icon={FileStack}
            trend="↑ 12.4% this period"
          />
          <KpiCard label="Open Issues" value={kpis ? kpis.open.toLocaleString("en-IN") : "—"} icon={FolderOpen} />
          <KpiCard label="High / Critical" value={kpis ? kpis.highCritical.toLocaleString("en-IN") : "—"} icon={AlertTriangle} tone="critical" />
          <KpiCard label="Resolved" value={kpis ? kpis.resolved.toLocaleString("en-IN") : "—"} icon={CheckCircle2} tone="resolved" />
          <KpiCard label="Avg. Resolution Time" value={kpis ? `${kpis.avgResolutionDays}d` : "—"} icon={Timer} />
          <KpiCard label="AI Routing Confidence" value={kpis ? `${kpis.aiRoutedPct}%` : "—"} icon={Route} tone="info" />
        </div>

        {/* Map + AI insights */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-display text-[15px] font-bold text-ink-900">Live Civic Map</h3>
              <Link href="/map" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-bright hover:underline">
                Open full map <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3">
              <ComplaintMapClient complaints={complaints ?? []} height="380px" />
            </div>
          </div>
          <AIInsightsPanel />
        </div>

        <DepartmentWorkloadTable />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentComplaintsTable limit={8} />
          </div>
          <ActivityTimeline limit={10} />
        </div>
      </div>
    </DashboardShell>
  );
}
