"use client";

import Link from "next/link";
import { Complaint, AIAnalysisBundle } from "@/types";
import { SeverityBadge, ConfidencePill } from "@/components/complaints/Badges";
import { departmentById, teamById } from "@/lib/reference-data";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Copy, Zap } from "lucide-react";

export function AIAnalysisResult({
  complaint,
  analysis,
}: {
  complaint: Complaint;
  analysis: AIAnalysisBundle;
}) {
  const dept = departmentById(complaint.departmentId);
  const team = teamById(complaint.serviceTeamId);
  const secondaryDept = complaint.secondaryDepartmentId ? departmentById(complaint.secondaryDepartmentId) : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border border-resolved/30 bg-resolved-bg px-5 py-4 text-[14px] font-semibold text-resolved">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Complaint {complaint.id} created successfully
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">AI Analysis</div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-4 sm:grid-cols-3">
          <Field label="Category" value={complaint.category} />
<Field label="Confidence" value={<ConfidencePill value={complaint.aiConfidence} />} />
<Field label="Severity" value={<SeverityBadge severity={complaint.severity} />} />
<Field
  label="AI Priority"
  value={
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        complaint.priority === "URGENT"
          ? "bg-red-100 text-red-700"
          : complaint.priority === "HIGH"
          ? "bg-orange-100 text-orange-700"
          : complaint.priority === "MEDIUM"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      <Zap className="h-3.5 w-3.5" />
      {complaint.priority}
    </span>
  }
/>
<Field label="Location" value={complaint.areaName} />
          <Field label="Ward" value={complaint.ward} />
          <Field label="Language" value={complaint.language} />
        </div>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <Field label="Primary Department" value={dept?.name ?? "—"} />
          <Field label="Responsible Team" value={team?.name ?? "—"} />
          {secondaryDept && <Field label="Secondary Department" value={secondaryDept.name} />}
        </div>

        <div className="mt-5 rounded-lg bg-navy-50/60 p-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Routing Decision — Why</div>
          <p className="text-[13.5px] leading-relaxed text-ink-700">{complaint.routingReason}</p>
        </div>
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
    <Zap className="h-4 w-4" />
    AI Automation
  </div>

  <p className="text-[13.5px] leading-relaxed text-ink-700">
    <span className="font-semibold">Priority automatically set to {complaint.priority}.</span>{" "}
    The system analyzed the issue severity and automatically determined the appropriate handling priority.
  </p>
</div>
        {analysis.duplicate.isDuplicate && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-medium/30 bg-medium-bg p-4">
            <Copy className="mt-0.5 h-4 w-4 shrink-0 text-medium" />
            <div className="text-[13px] text-ink-700">
              <span className="font-semibold text-medium">Possible duplicate detected. </span>
              {analysis.duplicate.matches[0]?.reason} Similarity:{" "}
              {Math.round((analysis.duplicate.matches[0]?.similarity ?? 0) * 100)}% with{" "}
              <Link href={`/complaint/${analysis.duplicate.matches[0]?.complaintId}`} className="font-semibold underline">
                {analysis.duplicate.matches[0]?.complaintId}
              </Link>
              .
            </div>
          </div>
        )}
        {!analysis.duplicate.isDuplicate && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-500">
            <CheckCircle2 className="h-4 w-4 text-resolved" /> No duplicate found — this is a new tracked issue.
          </div>
        )}

        {(complaint.privacy.faceDetected || complaint.privacy.numberPlateDetected) && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-high/30 bg-high-bg p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-high" />
            <div className="text-[13px] text-ink-700">
  <span className="font-semibold text-high">Privacy AI: </span>
  {(complaint.privacy.faceDetected ||
    complaint.privacy.numberPlateDetected) &&
    "Sensitive information detected. "}
  {complaint.privacy.recommendation}
</div>
          </div>
        )}

        {complaint.severity === "HIGH" || complaint.severity === "CRITICAL" ? (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-high">
            <AlertTriangle className="h-4 w-4" /> Flagged for priority handling due to {complaint.severity.toLowerCase()} severity.
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/complaint/${complaint.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-3 text-[13.5px] font-semibold text-white hover:bg-navy-800"
        >
          View Complaint {complaint.id} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center rounded-lg border border-border px-5 py-3 text-[13.5px] font-semibold text-ink-700 hover:bg-navy-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-ink-400">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-ink-900">{value}</div>
    </div>
  );
}
