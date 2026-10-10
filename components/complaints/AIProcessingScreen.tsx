"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

const STEPS = [
  "Language detected",
  "Civic issue identified",
  "Severity assessed",
  "Privacy scan completed",
  "Duplicate check completed",
  "Geographic area determined",
  "Responsible department identified",
  "Responsible team identified",
];

export function AIProcessingScreen({ done }: { done: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= STEPS.length) return;
    const delay = done ? 90 : 260;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleCount, done]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-4 font-display text-[16px] font-bold text-ink-900">Analyzing complaint…</h3>
      <ul className="space-y-2.5">
        {STEPS.map((step, i) => {
          const complete = i < visibleCount;
          const active = i === visibleCount;
          return (
            <li key={step} className="flex items-center gap-2.5 text-[13.5px]">
              {complete ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-resolved" />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-bright" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-border-strong" />
              )}
              <span className={complete ? "text-ink-900" : active ? "text-ink-700" : "text-ink-400"}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const AI_PROCESSING_STEP_COUNT = STEPS.length;
