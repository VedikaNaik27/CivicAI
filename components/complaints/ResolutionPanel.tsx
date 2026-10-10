"use client";

import { useState } from "react";
import { Complaint } from "@/types";
import { ImageUpload } from "@/components/complaints/ImageUpload";
import { CheckCircle2, XCircle, Sparkles, Loader2 } from "lucide-react";

export function ResolutionPanel({
  complaint,
  onUpdate,
}: {
  complaint: Complaint;
  onUpdate: (c: Complaint) => void;
}) {
  const [before, setBefore] = useState<{ name: string; dataUrl: string } | null>(null);
  const [after, setAfter] = useState<{ name: string; dataUrl: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const runVerification = async () => {
    setVerifying(true);
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "resolution",
        beforeUrl: before?.dataUrl ?? complaint.imageUrl,
        afterUrl: after?.dataUrl,
      }),
    });
    const data = await res.json();
    setVerifying(false);
    if (res.ok) onUpdate(data.complaint);
  };

  const confirmResolution = async (confirmed: boolean) => {
    setConfirming(true);
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", citizenConfirmed: confirmed }),
    });
    const data = await res.json();
    setConfirming(false);
    if (res.ok) onUpdate(data.complaint);
  };

  if (complaint.status === "Resolved") {
    return (
      <div className="rounded-xl border border-resolved/30 bg-resolved-bg p-5">
        <div className="flex items-center gap-2 font-semibold text-resolved">
          <CheckCircle2 className="h-[18px] w-[18px]" /> Resolution confirmed
        </div>
        {complaint.resolution?.aiResult && (
          <p className="mt-2 text-[13px] text-ink-700">
            Demo AI Resolution Verification: {complaint.resolution.aiResult.reason} (confidence{" "}
            {Math.round(complaint.resolution.aiResult.confidence * 100)}%)
          </p>
        )}
      </div>
    );
  }

  if (complaint.status === "Reopened") {
    return (
      <div className="rounded-xl border border-critical/30 bg-critical-bg p-5 text-[13.5px] text-ink-700">
        <span className="font-semibold text-critical">Reopened —</span> the citizen indicated this issue is not
        yet resolved. The department should re-inspect and upload new resolution evidence.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!complaint.resolution?.aiResult && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-1 font-display text-[15px] font-bold text-ink-900">Upload Resolution Evidence</h3>
          <p className="mb-4 text-[12.5px] text-ink-500">
            Department staff: upload before/after photos, then run Demo AI Resolution Verification.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-600">Before Photo</span>
              <ImageUpload onImage={setBefore} />
            </div>
            <div>
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-600">After Photo</span>
              <ImageUpload onImage={setAfter} />
            </div>
          </div>
          <button
            onClick={runVerification}
            disabled={!after || verifying}
            className="mt-4 flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Run AI Resolution Verification
          </button>
        </div>
      )}

      {complaint.resolution?.aiResult && !complaint.resolution.citizenConfirmed && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                complaint.resolution.aiResult.success ? "bg-resolved-bg text-resolved" : "bg-high-bg text-high"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold text-ink-900">
                {complaint.resolution.aiResult.success ? "Resolution appears successful." : "Resolution unclear."}
              </div>
              <div className="text-[12px] text-ink-500">
                Demo AI confidence: {Math.round(complaint.resolution.aiResult.confidence * 100)}%
              </div>
            </div>
          </div>
          <p className="mb-4 text-[13px] text-ink-600">{complaint.resolution.aiResult.reason}</p>

          <div className="rounded-lg bg-navy-50/60 p-4">
            <p className="mb-3 text-[13.5px] font-semibold text-ink-900">Does this issue appear resolved?</p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmResolution(true)}
                disabled={confirming}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-resolved px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Yes
              </button>
              <button
                onClick={() => confirmResolution(false)}
                disabled={confirming}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-critical/40 px-4 py-2.5 text-[13px] font-semibold text-critical disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
