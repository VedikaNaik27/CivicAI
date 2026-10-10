"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Complaint, ComplaintStatus } from "@/types";
import { SeverityBadge, StatusBadge, ConfidencePill } from "@/components/complaints/Badges";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { ResolutionPanel } from "@/components/complaints/ResolutionPanel";
import { ComplaintMapClient } from "@/components/maps/ComplaintMapClient";
import { departmentById, teamById } from "@/lib/reference-data";
import { formatDateTime } from "@/lib/format";
import { ArrowLeft, ShieldAlert, Copy, MapPin, Languages } from "lucide-react";

const NEXT_STATUS: Partial<Record<ComplaintStatus, ComplaintStatus>> = {
  Open: "Assigned",
  Assigned: "In Progress",
};

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/complaints/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return;
        }
        const d = await r.json();
        setComplaint(d.complaint);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const advanceStatus = async () => {
    if (!complaint) return;
    const next = NEXT_STATUS[complaint.status];
    if (!next) return;
    setUpdating(true);
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status: next }),
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) setComplaint(data.complaint);
  };

  if (notFound) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-[20px] font-bold text-ink-900">Complaint not found</h1>
          <p className="mt-2 text-[13.5px] text-ink-500">
            We couldn&apos;t find a complaint with ID &ldquo;{id}&rdquo;. It may have been removed or the link is
            incorrect.
          </p>
          <Link href="/dashboard/issues" className="mt-4 inline-block text-[13.5px] font-semibold text-accent-bright hover:underline">
            Browse all issues
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!complaint) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-4xl space-y-4 py-6">
          <div className="h-8 w-64 animate-pulse rounded bg-navy-50" />
          <div className="h-64 w-full animate-pulse rounded-xl bg-navy-50" />
        </div>
      </DashboardShell>
    );
  }

  const dept = departmentById(complaint.departmentId);
  const team = teamById(complaint.serviceTeamId);
  const secondaryDept = complaint.secondaryDepartmentId ? departmentById(complaint.secondaryDepartmentId) : undefined;
  const nextStatus = NEXT_STATUS[complaint.status];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard/issues" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> All Issues
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[13px] font-semibold text-navy-700">{complaint.id}</span>
              <StatusBadge status={complaint.status} />
              <SeverityBadge severity={complaint.severity} />
            </div>
            <h1 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink-900">{complaint.title}</h1>
            <p className="mt-1 text-[13px] text-ink-500">Reported {formatDateTime(complaint.createdAt)}</p>
          </div>
          {nextStatus && (
            <button
              onClick={advanceStatus}
              disabled={updating}
              className="rounded-lg bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
            >
              Mark as {nextStatus}
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {complaint.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={complaint.imageUrl} alt={complaint.category} className="max-h-96 w-full object-cover" />
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-3 font-display text-[15px] font-bold text-ink-900">Description</h3>
              <p className="text-[14px] leading-relaxed text-ink-700">{complaint.description}</p>
              {complaint.originalText && complaint.originalText !== complaint.description && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-navy-50/60 p-3 text-[13px] text-ink-600">
                  <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Original ({complaint.language}): </span>
                    {complaint.originalText}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900">
                <MapPin className="h-4 w-4" /> Location
              </h3>
              <div className="mb-3 grid grid-cols-2 gap-y-2 text-[13px] text-ink-700 sm:grid-cols-4">
                <div><span className="text-ink-400">Area</span><br />{complaint.areaName}</div>
                <div><span className="text-ink-400">Ward</span><br />{complaint.ward}</div>
                <div><span className="text-ink-400">Zone</span><br />{complaint.zone}</div>
                <div><span className="text-ink-400">Coordinates</span><br />{complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}</div>
              </div>
              <ComplaintMapClient complaints={[complaint]} height="260px" fitToData={false} />
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-display text-[15px] font-bold text-ink-900">Complaint Timeline</h3>
              <ComplaintTimeline history={complaint.statusHistory} />
            </div>

            <ResolutionPanel complaint={complaint} onUpdate={setComplaint} />
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">AI Classification</h3>
              <div className="space-y-3 text-[13.5px]">
                <RowItem label="Category" value={complaint.category} />
                <RowItem label="AI Confidence" value={<ConfidencePill value={complaint.aiConfidence} />} />
                <RowItem label="Severity" value={<SeverityBadge severity={complaint.severity} />} />
                <RowItem label="Language" value={complaint.language} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Routing</h3>
              <div className="space-y-3 text-[13.5px]">
                <RowItem label="Primary Department" value={dept?.name ?? "—"} />
                <RowItem label="Responsible Team" value={team?.name ?? "—"} />
                {secondaryDept && <RowItem label="Secondary Department" value={secondaryDept.name} />}
              </div>
              <p className="mt-3 rounded-lg bg-navy-50/60 p-3 text-[12.5px] leading-relaxed text-ink-600">
                {complaint.routingReason}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Privacy Scan
              </h3>
              <div className="space-y-2 text-[13px] text-ink-700">
                <RowItem label="Face detected" value={complaint.privacy.faceDetected ? "Yes" : "No"} />
                <RowItem label="Number plate detected" value={complaint.privacy.numberPlateDetected ? "Yes" : "No"} />
              </div>
              <p className="mt-3 text-[12.5px] text-ink-500">{complaint.privacy.recommendation}</p>
            </div>

            {complaint.duplicateOf && (
              <div className="rounded-xl border border-medium/30 bg-medium-bg p-5">
                <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-medium">
                  <Copy className="h-4 w-4" /> Linked as duplicate
                </h3>
                <p className="text-[13px] text-ink-700">
                  This complaint is tracked as a duplicate of{" "}
                  <Link href={`/complaint/${complaint.duplicateOf}`} className="font-semibold underline">
                    {complaint.duplicateOf}
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function RowItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
