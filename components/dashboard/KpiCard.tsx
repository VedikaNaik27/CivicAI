import { LucideIcon, TrendingUp } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
  demo = true,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  tone?: "default" | "critical" | "resolved" | "info";
  demo?: boolean;
}) {
  const toneStyles: Record<string, string> = {
    default: "bg-navy-50 text-navy-700",
    critical: "bg-high-bg text-high",
    resolved: "bg-resolved-bg text-resolved",
    info: "bg-info-bg text-info",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        {demo && (
          <span className="rounded border border-border-strong px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">
            Demo Data
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-[26px] font-bold leading-none text-ink-900">{value}</div>
      <div className="mt-1.5 text-[13px] text-ink-500">{label}</div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-[12px] font-medium text-resolved">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
      )}
    </div>
  );
}
