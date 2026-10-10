"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ComplaintMapClient } from "@/components/maps/ComplaintMapClient";
import { Complaint, ComplaintStatus, IssueCategory, Severity } from "@/types";
import { DEMO_WARDS } from "@/lib/reference-data";

const CATEGORIES: (IssueCategory | "All")[] = [
  "All",
  "Pothole",
  "Streetlight",
  "Garbage",
  "Drainage",
  "Water Leakage",
  "Flooding",
  "Traffic Signal",
  "Fallen Tree",
  "Road Damage",
  "Unsafe Infrastructure",
  "Other",
];
const SEVERITIES: (Severity | "All")[] = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES: (ComplaintStatus | "All")[] = ["All", "Open", "Assigned", "In Progress", "Resolved"];

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("All");
  const [severity, setSeverity] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [ward, setWard] = useState<string>("All");

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
      return true;
    });
  }, [complaints, category, severity, status, ward]);

  const counts = useMemo(() => {
    const open = complaints.filter((c) => c.status !== "Resolved");
    return {
      CRITICAL: open.filter((c) => c.severity === "CRITICAL").length,
      HIGH: open.filter((c) => c.severity === "HIGH").length,
      MEDIUM: open.filter((c) => c.severity === "MEDIUM").length,
      LOW: open.filter((c) => c.severity === "LOW").length,
    };
  }, [complaints]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Live Civic Map</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            {loading ? "Loading complaints…" : `Showing ${filtered.length} of ${complaints.length} demo complaints`}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Live Civic Issues</h3>
              <div className="space-y-2 text-[13.5px]">
                <CountRow color="#c62828" label="Critical" value={counts.CRITICAL} />
                <CountRow color="#c2560c" label="High" value={counts.HIGH} />
                <CountRow color="#b8860b" label="Medium" value={counts.MEDIUM} />
                <CountRow color="#2f6fed" label="Low" value={counts.LOW} />
              </div>
            </div>

            <FilterGroup label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
            <FilterGroup label="Severity" options={SEVERITIES} value={severity} onChange={setSeverity} />
            <FilterGroup label="Status" options={STATUSES} value={status} onChange={setStatus} />
            <FilterGroup label="Ward" options={["All", ...DEMO_WARDS]} value={ward} onChange={setWard} />
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-surface p-3 shadow-sm">
              <ComplaintMapClient complaints={filtered} height="calc(100vh - 220px)" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function CountRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-700">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-400">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition ${
              value === opt ? "border-navy-700 bg-navy-900 text-white" : "border-border text-ink-600 hover:bg-navy-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
