"use client";

import { useEffect, useState } from "react";
import { Complaint } from "@/types";
import { timeAgo } from "@/lib/format";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

export function ActivityTimeline({ limit = 8 }: { limit?: number }) {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d: { complaints: Complaint[] }) => {
        const events: ActivityItem[] = [];
        for (const c of d.complaints) {
          for (const h of c.statusHistory) {
            events.push({ id: `${c.id}-${h.timestamp}-${h.status}`, text: `${h.note ?? `${c.id} status changed to ${h.status}`}${h.note ? "" : ""}`, timestamp: h.timestamp });
          }
          if (c.duplicateOf) {
            events.push({
              id: `${c.id}-dup`,
              text: `Duplicate detected for ${c.id}, linked to ${c.duplicateOf}`,
              timestamp: c.createdAt,
            });
          }
          if (c.notificationSent && c.notificationMessage) {
  events.push({
    id: `${c.id}-notification`,
    text: `🔔 CivicAI Automation: ${c.notificationMessage}`,
    timestamp: c.escalatedAt ?? c.updatedAt,
  });
}
        }
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setItems(events.slice(0, limit));
      })
      .catch(() => setItems([]));
  }, [limit]);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Activity className="h-4 w-4 text-navy-700" />
        <h3 className="font-display text-[15px] font-bold text-ink-900">Live Activity</h3>
      </div>
      <ul className="max-h-[420px] overflow-y-auto divide-y divide-border">
        {items === null &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="animate-pulse px-5 py-3.5">
              <div className="h-3 w-4/5 rounded bg-navy-50" />
            </li>
          ))}
        {items?.map((item, index) => (
        <li key={`${item.id}-${index}`} className="px-5 py-3.5">
            <p className="text-[13px] leading-snug text-ink-700">{item.text}</p>
            <p className="mt-1 text-[11px] text-ink-400">{timeAgo(item.timestamp)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
