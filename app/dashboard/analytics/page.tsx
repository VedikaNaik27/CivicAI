"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Complaint } from "@/types";
import {
  computeCategoryDistribution,
  computeSeverityDistribution,
  computeIssuesOverTime,
  computeResolutionTrend,
  computeLanguageDistribution,
  computeKPIs,
} from "@/lib/aggregate";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#c62828",
  HIGH: "#c2560c",
  MEDIUM: "#b8860b",
  LOW: "#2f6fed",
};

const LANGUAGE_COLORS = ["#1c3a63", "#2f6fed", "#b8860b"];

const AI_METRICS = [
  { label: "Classification Confidence", value: 91 },
  { label: "Routing Confidence", value: 94 },
  { label: "Duplicate Detection Confidence", value: 88 },
  { label: "Privacy Detection Confidence", value: 90 },
  { label: "Resolution Verification Confidence", value: 87 },
];

export default function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    fetch("/api/complaints").then((r) => r.json()).then((d) => setComplaints(d.complaints));
  }, []);

  const kpis = useMemo(() => computeKPIs(complaints), [complaints]);
  const categoryData = useMemo(() => computeCategoryDistribution(complaints), [complaints]);
  const severityData = useMemo(() => computeSeverityDistribution(complaints), [complaints]);
  const timeData = useMemo(() => computeIssuesOverTime(complaints), [complaints]);
  const resolutionData = useMemo(() => computeResolutionTrend(complaints), [complaints]);
  const languageData = useMemo(() => computeLanguageDistribution(complaints), [complaints]);
  const duplicateCount = complaints.filter((c) => c.duplicateOf).length;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">Analytics</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">Live statistics computed from the current demo dataset.</p>
          </div>
          <span className="rounded border border-border-strong px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            Demo Metrics
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Complaints" value={String(kpis.total)} />
          <StatCard label="Duplicate Complaints" value={String(duplicateCount)} />
          <StatCard label="AI-Routed Share" value={`${kpis.aiRoutedPct}%`} />
          <StatCard label="Avg. Resolution Time" value={`${kpis.avgResolutionDays}d`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Issues by Category">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e6ed" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11.5, fill: "#3a4459" }} />
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, borderColor: "#e2e6ed" }} />
                <Bar dataKey="count" fill="#1c3a63" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Severity Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="severity" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {severityData.map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, borderColor: "#e2e6ed" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Issues Over Time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ed" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, borderColor: "#e2e6ed" }} />
                <Line type="monotone" dataKey="count" stroke="#2f6fed" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Resolution Trend">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ed" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, borderColor: "#e2e6ed" }} />
                <Line type="monotone" dataKey="resolved" stroke="#158a5f" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Language Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={languageData} dataKey="count" nameKey="language" outerRadius={95} label>
                  {languageData.map((entry, i) => (
                    <Cell key={entry.language} fill={LANGUAGE_COLORS[i % LANGUAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, borderColor: "#e2e6ed" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Demo AI Confidence Metrics">
            <div className="space-y-4 py-2">
              {AI_METRICS.map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex items-center justify-between text-[12.5px]">
                    <span className="text-ink-600">{m.label}</span>
                    <span className="font-semibold text-ink-900">{m.value}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                    <div className="h-full rounded-full bg-accent-bright" style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[22px] font-bold text-ink-900">{value}</div>
      <div className="mt-1 text-[13px] text-ink-500">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-3 font-display text-[15px] font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}
