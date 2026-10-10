"use client";

import { useEffect, useState } from "react";
import { AIInsight } from "@/services/ai/insights";
import { Sparkles, TrendingUp, Copy, Flame, Route, Languages, AlertTriangle } from "lucide-react";

const ICONS: Record<AIInsight["icon"], typeof TrendingUp> = {
  trend: TrendingUp,
  duplicate: Copy,
  hotspot: Flame,
  routing: Route,
  language: Languages,
  severity: AlertTriangle,
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[] | null>(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => setInsights(d.insights))
      .catch(() => setInsights([]));
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-display text-[15px] font-bold text-ink-900">AI Insights</h3>
        </div>
        <span className="rounded border border-border-strong px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">
          Demo AI
        </span>
      </div>
      <div className="divide-y divide-border">
        {insights === null &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse px-5 py-4">
              <div className="h-3.5 w-3/4 rounded bg-navy-50" />
            </div>
          ))}
        {insights?.length === 0 && (
          <div className="px-5 py-6 text-sm text-ink-500">No insights available yet — submit a complaint to see AI insights update.</div>
        )}
        {insights?.map((insight) => {
          const Icon = ICONS[insight.icon];
          return (
            <div key={insight.id} className="flex items-start gap-3 px-5 py-3.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-[13.5px] leading-snug text-ink-700">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
