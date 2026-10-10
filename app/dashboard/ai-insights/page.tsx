"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Complaint } from "@/types";
import { generateInsights, detectHotspots } from "@/services/ai/insights";
import {
  Languages, ScanEye, Gauge, ShieldCheck, Copy, MapPinned, CheckCircle2, Flame, Sparkles,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: Languages,
    title: "1. Multilingual Understanding",
    input: "Voice or text in English, Kannada or Hindi",
    output: "Detected language + normalized English meaning",
    impact: "Removes the language barrier between citizens and civic departments — no manual translation step.",
  },
  {
    icon: ScanEye,
    title: "2. Image Classification",
    input: "Uploaded photo of the civic issue",
    output: "Issue category (e.g. Pothole, Garbage) with confidence score",
    impact: "Citizens don't need to know department names or issue taxonomies — a photo is enough.",
  },
  {
    icon: Gauge,
    title: "3. Severity Intelligence",
    input: "Issue category + description signals",
    output: "LOW / MEDIUM / HIGH / CRITICAL severity with reasoning",
    impact: "Ensures dangerous issues are surfaced first instead of waiting in a first-come queue.",
  },
  {
    icon: ShieldCheck,
    title: "4. Privacy Protection",
    input: "Uploaded photo",
    output: "Face / number-plate detection + blur recommendation",
    impact: "Protects bystanders and vehicle owners before any image reaches a public dashboard.",
  },
  {
    icon: Copy,
    title: "5. Duplicate Detection",
    input: "New complaint text, category, and coordinates",
    output: "Similarity score against nearby open complaints",
    impact: "Turns dozens of reports about the same pothole into one tracked, prioritized ticket.",
  },
  {
    icon: MapPinned,
    title: "6. Smart Geographic Routing",
    input: "AI category + ward/zone",
    output: "Responsible department and local service team",
    impact: "Reduces manual triage effort and gets issues to the team that can actually fix them.",
  },
  {
    icon: CheckCircle2,
    title: "7. Resolution Verification",
    input: "Before / after photos from the field team",
    output: "Pass/fail signal with confidence, pending citizen confirmation",
    impact: "Adds independent verification before a ticket is marked resolved — not just staff self-report.",
  },
  {
    icon: Flame,
    title: "8. Civic Pattern Detection",
    input: "All open complaints, grouped by category + ward",
    output: "Hotspot clusters above a threshold",
    impact: "Surfaces systemic problem areas (e.g. one ward with 17 pothole reports) for infrastructure planning.",
  },
];

export default function AIInsightsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    fetch("/api/complaints").then((r) => r.json()).then((d) => setComplaints(d.complaints));
  }, []);

  const insights = useMemo(() => generateInsights(complaints), [complaints]);
  const hotspots = useMemo(() => detectHotspots(complaints, 3), [complaints]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-navy-700" />
            <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-900">AI Insights</h1>
          </div>
          <p className="mt-1 text-[13.5px] text-ink-500">
            What each AI capability does in CivicAI, in plain terms — with live civic impact.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                <cap.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-[14.5px] font-bold text-ink-900">{cap.title}</h3>
              <dl className="mt-3 space-y-2 text-[12.5px]">
                <div>
                  <dt className="font-semibold text-ink-500">Input</dt>
                  <dd className="text-ink-700">{cap.input}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-500">Output</dt>
                  <dd className="text-ink-700">{cap.output}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-500">Civic Impact</dt>
                  <dd className="text-ink-700">{cap.impact}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-3 font-display text-[15px] font-bold text-ink-900">Live AI Insight Feed</h3>
            <ul className="space-y-3">
              {insights.map((i) => (
                <li key={i.id} className="rounded-lg bg-navy-50/60 p-3 text-[13px] text-ink-700">{i.text}</li>
              ))}
              {insights.length === 0 && <li className="text-[13px] text-ink-500">No insights yet.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-[15px] font-bold text-ink-900">
              <Flame className="h-4 w-4 text-high" /> Civic Pattern Detection — Hotspots
            </h3>
            <div className="space-y-2.5">
              {hotspots.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-[13px]">
                  <div>
                    <span className="font-semibold text-ink-900">{h.category}</span>
                    <span className="ml-1.5 text-ink-500">in {h.ward}</span>
                  </div>
                  <span className="rounded bg-high-bg px-2 py-0.5 text-[11.5px] font-semibold text-high">{h.count} reports</span>
                </div>
              ))}
              {hotspots.length === 0 && <p className="text-[13px] text-ink-500">No hotspot clusters detected in the current demo data.</p>}
              <p className="pt-2 text-[11.5px] text-ink-400">
                Demo civic pattern detection — based on seeded demo data, not a real-world prediction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
