"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Complaint } from "@/types";
import { DEPARTMENTS } from "@/lib/reference-data";
import { computeDepartmentWorkload } from "@/lib/aggregate";
import { SeverityBadge, StatusBadge } from "@/components/complaints/Badges";
import * as Icons from "lucide-react";
import { Building2, ArrowUpRight } from "lucide-react";
import { timeAgo } from "@/lib/format";

function iconFor(name: string) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
  return Icon ?? Building2;
}

export default function DepartmentsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState(DEPARTMENTS[0].id);

  useEffect(() => {
    fetch("/api/complaints").then((r) => r.json()).then((d) => setComplaints(d.complaints));
  }, []);

  const workload = useMemo(() => computeDepartmentWorkload(complaints), [complaints]);
  const selectedComplaints = useMemo(
    () => complaints.filter((c) => c.departmentId === selected).slice(0, 12),
    [complaints, selected]
  );
  const selectedDept = DEPARTMENTS.find((d) => d.id === selected)!;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Departments</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">Workload, priority and resolution speed by service department.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workload.map((row) => {
            const Icon = iconFor(row.icon);
            return (
              <button
                key={row.departmentId}
                onClick={() => setSelected(row.departmentId)}
                className={`rounded-xl border p-4 text-left shadow-sm transition ${
                  selected === row.departmentId ? "border-navy-700 bg-navy-50" : "border-border bg-surface hover:bg-navy-50/50"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="mt-3 font-display text-[14.5px] font-bold text-ink-900">{row.departmentName}</div>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-500">
                  <span>{row.open} open</span>
                  <span className={row.highPriority > 0 ? "font-semibold text-high" : ""}>{row.highPriority} high priority</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-[15px] font-bold text-ink-900">Department Workload</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-2.5 font-semibold">Department</th>
                  <th className="px-3 py-2.5 font-semibold">Open</th>
                  <th className="px-3 py-2.5 font-semibold">High Priority</th>
                  <th className="px-3 py-2.5 font-semibold">In Progress</th>
                  <th className="px-3 py-2.5 font-semibold">Resolved</th>
                  <th className="px-3 py-2.5 font-semibold">Avg. Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workload.map((row) => (
                  <tr key={row.departmentId} className="hover:bg-navy-50/50">
                    <td className="px-5 py-3 font-medium text-ink-900">{row.departmentName}</td>
                    <td className="px-3 py-3">{row.open}</td>
                    <td className="px-3 py-3">
                      <span className={row.highPriority > 0 ? "font-semibold text-high" : "text-ink-500"}>{row.highPriority}</span>
                    </td>
                    <td className="px-3 py-3">{row.inProgress}</td>
                    <td className="px-3 py-3 text-resolved">{row.resolved}</td>
                    <td className="px-3 py-3">{row.avgResolutionDays > 0 ? `${row.avgResolutionDays}d` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-[15px] font-bold text-ink-900">{selectedDept.name} — Assigned Issues</h3>
            <p className="text-[12.5px] text-ink-500">{selectedDept.description}</p>
          </div>
          <ul className="divide-y divide-border">
            {selectedComplaints.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12.5px] font-semibold text-navy-700">{c.id}</span>
                    <span className="truncate text-[13.5px] text-ink-900">{c.category} · {c.areaName}</span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-ink-400">{timeAgo(c.createdAt)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SeverityBadge severity={c.severity} />
                  <StatusBadge status={c.status} />
                  <Link href={`/complaint/${c.id}`} className="text-accent-bright">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
            {selectedComplaints.length === 0 && (
              <li className="px-5 py-8 text-center text-[13px] text-ink-500">No complaints assigned to this department yet.</li>
            )}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
