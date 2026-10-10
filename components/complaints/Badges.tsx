import { ComplaintStatus, Severity } from "@/types";

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "text-critical bg-critical-bg border-critical/20",
  HIGH: "text-high bg-high-bg border-high/20",
  MEDIUM: "text-medium bg-medium-bg border-medium/20",
  LOW: "text-info bg-info-bg border-info/20",
};

export function SeverityBadge({ severity, className = "" }: { severity: Severity; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide ${SEVERITY_STYLES[severity]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Open: "text-ink-700 bg-navy-50 border-border-strong",
  Assigned: "text-info bg-info-bg border-info/20",
  "In Progress": "text-medium bg-medium-bg border-medium/20",
  "Resolution Uploaded": "text-high bg-high-bg border-high/20",
  Resolved: "text-resolved bg-resolved-bg border-resolved/20",
  Reopened: "text-critical bg-critical-bg border-critical/20",
};

export function StatusBadge({ status, className = "" }: { status: ComplaintStatus | string; className?: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Open;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${style} ${className}`}>
      {status}
    </span>
  );
}

export function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700">
      <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-navy-50">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-accent-bright"
          style={{ width: `${pct}%` }}
        />
      </span>
      {pct}%
    </span>
  );
}
