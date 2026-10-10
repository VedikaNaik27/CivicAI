import { NextRequest, NextResponse } from "next/server";
import { getComplaintById, updateComplaint } from "@/lib/store";
import { verifyResolution } from "@/services/ai/resolution";
import { ComplaintStatus, StatusHistoryEntry } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const complaint = getComplaintById(id);
  if (!complaint) {
    return NextResponse.json({ error: `Complaint ${id} was not found.` }, { status: 404 });
  }
  return NextResponse.json({ complaint });
}

export interface PatchComplaintBody {
  action: "status" | "resolution" | "confirm";
  status?: ComplaintStatus;
  note?: string;
  actor?: string;
  beforeUrl?: string;
  afterUrl?: string;
  citizenConfirmed?: boolean;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const complaint = getComplaintById(id);
  if (!complaint) {
    return NextResponse.json({ error: `Complaint ${id} was not found.` }, { status: 404 });
  }

  const body = (await req.json()) as PatchComplaintBody;
  const now = new Date().toISOString();

  if (body.action === "status") {
    if (!body.status) return NextResponse.json({ error: "A status value is required." }, { status: 400 });
    const entry: StatusHistoryEntry = {
      status: body.status,
      note: body.note || `Status changed to ${body.status}.`,
      actor: body.actor || "Department Staff",
      timestamp: now,
    };
    const updated = updateComplaint(id, {
      status: body.status,
      statusHistory: [...complaint.statusHistory, entry],
    });
    return NextResponse.json({ complaint: updated });
  }

  if (body.action === "resolution") {
    const aiResult = verifyResolution({ beforeUrl: body.beforeUrl, afterUrl: body.afterUrl });
    const entry: StatusHistoryEntry = {
      status: "Resolution Uploaded",
      note: "Before/after evidence uploaded; AI resolution verification run.",
      actor: body.actor || "Department Staff",
      timestamp: now,
    };
    const updated = updateComplaint(id, {
      status: "Resolution Uploaded",
      resolution: {
        beforeUrl: body.beforeUrl,
        afterUrl: body.afterUrl,
        aiResult,
      },
      statusHistory: [...complaint.statusHistory, entry],
    });
    return NextResponse.json({ complaint: updated, aiResult });
  }

  if (body.action === "confirm") {
    const finalStatus: ComplaintStatus = body.citizenConfirmed ? "Resolved" : "Reopened";
    const entry: StatusHistoryEntry = {
      status: finalStatus,
      note: body.citizenConfirmed
        ? "Citizen confirmed the issue is resolved."
        : "Citizen reported the issue is not resolved; reopened for department review.",
      actor: "Citizen",
      timestamp: now,
    };
    const updated = updateComplaint(id, {
      status: finalStatus,
      resolution: {
        ...complaint.resolution,
        citizenConfirmed: body.citizenConfirmed,
        citizenRespondedAt: now,
      },
      statusHistory: [...complaint.statusHistory, entry],
    });
    return NextResponse.json({ complaint: updated });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
