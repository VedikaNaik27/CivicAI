"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Complaint } from "@/types";
import { SeverityBadge, StatusBadge, ConfidencePill } from "@/components/complaints/Badges";
import { departmentById, teamById } from "@/lib/reference-data";
import { ArrowUpRight, AlertTriangle } from "lucide-react";

export function RecentComplaintsTable({ limit = 8 }: { limit?: number }) {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints))
      .catch(() => setComplaints([]));
  }, []);

  const rows = (complaints ?? []).slice(0, limit);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-display text-[15px] font-bold text-ink-900">Recent AI-Routed Complaints</h3>
        <Link href="/dashboard/issues" className="text-[12.5px] font-semibold text-accent-bright hover:underline">
          View all issues
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-400">
              <th className="px-5 py-2.5 font-semibold">Complaint ID</th>
              <th className="px-3 py-2.5 font-semibold">Issue</th>
              <th className="px-3 py-2.5 font-semibold">Location</th>
              <th className="px-3 py-2.5 font-semibold">Severity</th>
              <th className="px-3 py-2.5 font-semibold">AI Confidence</th>
              <th className="px-3 py-2.5 font-semibold">Department</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {complaints === null &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-5 py-4">
                    <div className="h-3.5 w-full animate-pulse rounded bg-navy-50" />
                  </td>
                </tr>
              ))}
            {rows.map((c) => {
              const dept = departmentById(c.departmentId);
              const team = teamById(c.serviceTeamId);
              return (
                <tr key={c.id} className="hover:bg-navy-50/50">
                  <td className="px-5 py-3.5 font-mono text-[12.5px] font-semibold text-navy-700">{c.id}</td>
                  <td className="px-3 py-3.5 text-ink-900">{c.category}</td>
                  <td className="px-3 py-3.5 text-ink-700">
                    {c.areaName}
                    <span className="ml-1.5 text-ink-400">· {c.ward}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <SeverityBadge severity={c.severity} />
                  </td>
                  <td className="px-3 py-3.5">
                    <ConfidencePill value={c.aiConfidence} />
                  </td>
                  <td className="px-3 py-3.5 text-ink-700">
                    {dept?.name}
                    <div className="text-[11px] text-ink-400">{team?.name}</div>
                  </td>
                  <td className="px-3 py-3.5">
  <div className="flex flex-col items-start gap-1.5">
    <StatusBadge status={c.status} />

    {c.isEscalated && (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
        <AlertTriangle className="h-3 w-3" />
        ESCALATED
      </span>
    )}
  </div>
</td>
                  <td className="px-3 py-3.5 text-right">
                    <Link
                      href={`/complaint/${c.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-bright hover:underline"
                    >
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
