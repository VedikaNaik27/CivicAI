const STATUSES = [
  "AI Services Operational",
  "Smart Routing Active",
  "Duplicate Detection Active",
  "Privacy Protection Active",
];

export function SystemStatusBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-[12px] font-medium text-ink-700">
      {STATUSES.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="status-dot h-1.5 w-1.5 rounded-full bg-resolved" />
          {s}
        </span>
      ))}
    </div>
  );
}
