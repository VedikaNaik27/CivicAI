import { StatusHistoryEntry } from "@/types";
import { formatDateTime } from "@/lib/format";
import { CheckCircle2, Circle } from "lucide-react";

export function ComplaintTimeline({ history }: { history: StatusHistoryEntry[] }) {
  return (
    <ol className="space-y-0">
      {history.map((entry, i) => (
        <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
          {i < history.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />
          )}
          <span className="relative z-10 mt-0.5">
            {i === history.length - 1 ? (
              <CheckCircle2 className="h-4 w-4 text-resolved" />
            ) : (
              <Circle className="h-4 w-4 fill-navy-100 text-navy-400" />
            )}
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-ink-900">{entry.status}</div>
            {entry.note && <div className="text-[13px] text-ink-600">{entry.note}</div>}
            <div className="mt-0.5 text-[11.5px] text-ink-400">
              {formatDateTime(entry.timestamp)}
              {entry.actor ? ` · ${entry.actor}` : ""}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
