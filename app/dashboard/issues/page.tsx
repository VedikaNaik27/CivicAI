"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Complaint } from "@/types";
import { SeverityBadge, StatusBadge, ConfidencePill } from "@/components/complaints/Badges";
import { departmentById, teamById, DEMO_WARDS } from "@/lib/reference-data";
import { timeAgo } from "@/lib/format";
import { Search, ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  "All", "Pothole", "Road Damage", "Streetlight", "Garbage", "Drainage",
  "Water Leakage", "Flooding", "Traffic Signal", "Fallen Tree", "Unsafe Infrastructure", "Other",
];
const SEVERITIES = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["All", "Open", "Assigned", "In Progress", "Resolution Uploaded", "Resolved", "Reopened"];

export default function IssuesPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [ward, setWard] = useState("All");

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (severity !== "All" && c.severity !== severity) return false;
      if (status !== "All" && c.status !== status) return false;
      if (ward !== "All" && c.ward !== ward) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.id.toLowerCase().includes(q) &&
          !c.title.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !c.areaName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [complaints, category, severity, status, ward, query]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Issues</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            {loading ? "Loading…" : `${filtered.length} of ${complaints.length} complaints`}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:flex-wrap">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-navy-50/50 px-3 py-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, area…"
              className="w-full bg-transparent text-[13.5px] focus:outline-none"
            />
          </div>
          <Select value={category} onChange={setCategory} options={CATEGORIES} />
          <Select value={severity} onChange={setSeverity} options={SEVERITIES} />
          <Select value={status} onChange={setStatus} options={STATUSES} />
          <Select value={ward} onChange={setWard} options={["All", ...DEMO_WARDS]} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-3 py-3 font-semibold">Issue</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold">Severity</th>
                  <th className="px-3 py-3 font-semibold">Confidence</th>
                  <th className="px-3 py-3 font-semibold">Department</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Reported</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const dept = departmentById(c.departmentId);
                  const team = teamById(c.serviceTeamId);
                  return (
                    <tr key={c.id} className="hover:bg-navy-50/50">
                      <td className="px-5 py-3 font-mono text-[12.5px] font-semibold text-navy-700">{c.id}</td>
                      <td className="px-3 py-3 text-ink-900">{c.category}</td>
                      <td className="px-3 py-3 text-ink-700">{c.areaName} <span className="text-ink-400">· {c.ward}</span></td>
                      <td className="px-3 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-3 py-3"><ConfidencePill value={c.aiConfidence} /></td>
                      <td className="px-3 py-3 text-ink-700">
                        {dept?.name}
                        <div className="text-[11px] text-ink-400">{team?.name}</div>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3 text-ink-500">{timeAgo(c.createdAt)}</td>
                      <td className="px-3 py-3 text-right">
                        <Link href={`/complaint/${c.id}`} className="inline-flex items-center gap-1 font-semibold text-accent-bright hover:underline">
                          View <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-ink-500">
                      No complaints match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border px-3 py-2 text-[13px] text-ink-700 focus:border-navy-500 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
