import { Complaint, Severity } from "@/types";
import { DEPARTMENTS } from "@/lib/reference-data";

export interface KPIs {
  total: number;
  open: number;
  highCritical: number;
  resolved: number;
  avgResolutionDays: number;
  aiRoutedPct: number;
}

export function computeKPIs(complaints: Complaint[]): KPIs {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status !== "Resolved").length;
  const highCritical = complaints.filter(
    (c) => (c.severity === "HIGH" || c.severity === "CRITICAL") && c.status !== "Resolved"
  ).length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const resolvedDurations = complaints
    .filter((c) => c.status === "Resolved")
    .map((c) => (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24));
  const avgResolutionDays =
    resolvedDurations.length > 0
      ? Math.round((resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length) * 10) / 10
      : 0;

  const routed = complaints.filter((c) => c.status !== "Open").length;
  const aiRoutedPct = total > 0 ? Math.round((routed / total) * 100) : 0;

  return { total, open, highCritical, resolved, avgResolutionDays, aiRoutedPct };
}

export interface DepartmentWorkloadRow {
  departmentId: string;
  departmentName: string;
  icon: string;
  open: number;
  highPriority: number;
  inProgress: number;
  resolved: number;
  avgResolutionDays: number;
}

export function computeDepartmentWorkload(complaints: Complaint[]): DepartmentWorkloadRow[] {
  return DEPARTMENTS.map((dept) => {
    const deptComplaints = complaints.filter((c) => c.departmentId === dept.id);
    const open = deptComplaints.filter((c) => c.status !== "Resolved").length;
    const highPriority = deptComplaints.filter(
      (c) => (c.severity === "HIGH" || c.severity === "CRITICAL") && c.status !== "Resolved"
    ).length;
    const inProgress = deptComplaints.filter((c) => c.status === "In Progress").length;
    const resolved = deptComplaints.filter((c) => c.status === "Resolved").length;
    const durations = deptComplaints
      .filter((c) => c.status === "Resolved")
      .map((c) => (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24));
    const avgResolutionDays =
      durations.length > 0 ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      icon: dept.icon,
      open,
      highPriority,
      inProgress,
      resolved,
      avgResolutionDays,
    };
  });
}

export function computeCategoryDistribution(complaints: Complaint[]) {
  const map = new Map<string, number>();
  for (const c of complaints) {
    map.set(c.category, (map.get(c.category) ?? 0) + 1);
  }
  return [...map.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

export function computeSeverityDistribution(complaints: Complaint[]) {
  const order: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  return order.map((severity) => ({
    severity,
    count: complaints.filter((c) => c.severity === severity).length,
  }));
}

export function computeIssuesOverTime(complaints: Complaint[]) {
  const buckets = new Map<string, number>();
  for (const c of complaints) {
    const date = new Date(c.createdAt);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

export function computeResolutionTrend(complaints: Complaint[]) {
  const buckets = new Map<string, number>();
  for (const c of complaints) {
    if (c.status !== "Resolved") continue;
    const date = new Date(c.updatedAt);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, resolved]) => ({ date, resolved }));
}

export function computeLanguageDistribution(complaints: Complaint[]) {
  const map = new Map<string, number>();
  for (const c of complaints) {
    map.set(c.language, (map.get(c.language) ?? 0) + 1);
  }
  return [...map.entries()].map(([language, count]) => ({ language, count }));
}
