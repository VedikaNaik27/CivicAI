"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Map as MapIcon,
  ListChecks,
  BarChart3,
  Building2,
  Sparkles,
  Settings,
  Radio,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/report", label: "Report Issue", icon: FilePlus2 },
  { href: "/map", label: "Live Map", icon: MapIcon },
  { href: "/dashboard/issues", label: "Issues", icon: ListChecks },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={`flex h-full flex-col bg-navy-950 text-white ${mobile ? "w-72" : "w-64"}`}>
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-bright">
          <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-[15px] font-bold leading-none tracking-tight">CivicAI</div>
          <div className="mt-0.5 text-[10.5px] font-medium text-white/45">Command Center</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-lg bg-white/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Demo Mode Active
          </div>
          <p className="mt-1 text-[11px] leading-snug text-white/40">
            Running on simulated AI &amp; demo civic data.
          </p>
        </div>
      </div>
    </div>
  );
}
