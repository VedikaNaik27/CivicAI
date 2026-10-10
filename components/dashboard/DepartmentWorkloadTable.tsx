"use client";

import { useEffect, useState } from "react";
import { DepartmentWorkloadRow } from "@/lib/aggregate";
import * as Icons from "lucide-react";
import { Building2 } from "lucide-react";
import Link from "next/link";

function iconFor(name: string) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
  return Icon ?? Building2;
}

export function DepartmentWorkloadTable() {
  const [rows, setRows] = useState<DepartmentWorkloadRow[] | null>(null);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) => setRows(d.workload))
      .catch(() => setRows([]));
  }, []);

  const maxOpen = Math.max(1, ...(rows ?? []).map((r) => r.open));

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-display text-[15px] font-bold text-ink-900">Department Workload</h3>
        <Link href="/dashboard/departments" className="text-[12.5px] font-semibold text-accent-bright hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
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
            {rows === null &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-3.5 w-full animate-pulse rounded bg-navy-50" />
                  </td>
                </tr>
              ))}
            {rows?.map((row) => {
              const Icon = iconFor(row.icon);
              return (
                <tr key={row.departmentId} className="hover:bg-navy-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium text-ink-900">{row.departmentName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-navy-50">
                        <div
                          className="h-full rounded-full bg-navy-700"
                          style={{ width: `${(row.open / maxOpen) * 100}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-ink-700">{row.open}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={row.highPriority > 0 ? "font-semibold text-high" : "text-ink-500"}>
                      {row.highPriority}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-ink-700">{row.inProgress}</td>
                  <td className="px-3 py-3.5 text-resolved">{row.resolved}</td>
                  <td className="px-3 py-3.5 text-ink-700">
                    {row.avgResolutionDays > 0 ? `${row.avgResolutionDays}d` : "—"}
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
