import { NextRequest, NextResponse } from "next/server";
import {
  addComplaint,
  getAllComplaints,
  nextComplaintId,
  updateComplaint,
} from "@/lib/store";
import { normalizeAndDetect } from "@/services/ai/language";
import {
  classifyComplaint,
  classifyComplaintWithVision,
} from "@/services/ai/classification";
import { analyzeSeverity } from "@/services/ai/severity";
import { detectPersonalInformation } from "@/services/ai/privacy";
import { detectDuplicate } from "@/services/ai/duplicate";
import { assignDepartment } from "@/services/ai/routing";
import { Complaint, ComplaintStatus, IssueCategory, Language } from "@/types";
import { areaForWard, teamById } from "@/lib/reference-data";
import { automateComplaint } from "@/services/ai/automation";
import { checkEscalation } from "@/services/ai/escalation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let complaints = getAllComplaints();
    // Automatic escalation check
  const escalationDemoMode =
    process.env.ESCALATION_DEMO_MODE !== "false";

  for (const complaint of complaints) {
    const escalation = checkEscalation(complaint, escalationDemoMode);

    if (escalation.shouldEscalate) {
  const escalatedAt = new Date().toISOString();

  updateComplaint(complaint.id, {
    isEscalated: true,
    escalationReason: escalation.reason,
    escalatedAt,
    notificationSent: true,
      notificationMessage: `Complaint ${complaint.id} requires attention. It was automatically escalated because no action was recorded within the configured response window. Responsible team: ${
  teamById(complaint.serviceTeamId)?.name ?? complaint.serviceTeamId
}.`,
    statusHistory: [
      ...complaint.statusHistory,
      {
        status: complaint.status,
        note: `⚠️ Automatically escalated: ${escalation.reason}`,
        actor: "CivicAI Automation",
        timestamp: escalatedAt,
      },
     
    ],
  });
}
  }

  complaints = getAllComplaints();

  const category = searchParams.get("category");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");
  const ward = searchParams.get("ward");
  const departmentId = searchParams.get("departmentId");
  const q = searchParams.get("q");

  if (category && category !== "All") complaints = complaints.filter((c) => c.category === category);
  if (severity && severity !== "All") complaints = complaints.filter((c) => c.severity === severity);
  if (status && status !== "All") complaints = complaints.filter((c) => c.status === status);
  if (ward && ward !== "All") complaints = complaints.filter((c) => c.ward === ward);
  if (departmentId) complaints = complaints.filter((c) => c.departmentId === departmentId);
  if (q) {
    const lower = q.toLowerCase();
    complaints = complaints.filter(
      (c) =>
        c.id.toLowerCase().includes(lower) ||
        c.title.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.areaName.toLowerCase().includes(lower)
    );
  }

  return NextResponse.json({ complaints });
}

export interface CreateComplaintBody {
  text?: string;
  transcript?: string;
  language?: Language;
  imageName?: string;
  imageDataUrl?: string;
  lat: number;
  lng: number;
  areaName: string;
  ward: string;
  reporterName?: string;
  categoryOverride?: IssueCategory;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateComplaintBody;

    if (body.lat == null || body.lng == null || !body.ward) {
      return NextResponse.json(
        { error: "A location (latitude, longitude and ward) is required to submit a complaint." },
        { status: 400 }
      );
    }

    const rawText = body.transcript || body.text || "";
    if (!rawText && !body.imageName) {
      return NextResponse.json(
        { error: "Please provide a photo, voice recording or text description of the issue." },
        { status: 400 }
      );
    }

    // 1. Language detection + normalization
    const languageResult = normalizeAndDetect(rawText || "Civic issue reported via photo upload.");

    // 2. Classification (text + image filename heuristic)
    // 2. AI Classification (actual image + text)
    const classification = await classifyComplaintWithVision({
      text: body.text,
      transcript: body.transcript,
      normalizedText: languageResult.normalizedText,
      imageName: body.imageName,
      imageDataUrl: body.imageDataUrl,
    });
    const finalCategory = body.categoryOverride ?? classification.category;

    // 3. Severity
    const severity = analyzeSeverity({ category: finalCategory, text: languageResult.normalizedText || rawText });

    // 4. Privacy scan
    const privacy = detectPersonalInformation({ imageName: body.imageName, hasImage: !!body.imageName });

    // 5. Duplicate detection against existing store
    const existing = getAllComplaints();
    const duplicate = detectDuplicate(
      {
        category: finalCategory,
        description: languageResult.normalizedText || rawText,
        lat: body.lat,
        lng: body.lng,
        imageName: body.imageName,
      },
      existing
    );

    // 6. Geographic + department routing
    const area = areaForWard(body.ward);
    const routing = assignDepartment({
      category: finalCategory,
      ward: body.ward,
      areaName: body.areaName || area?.areaName || body.ward,
    });

    // 7. AI automation: priority + next actions
      const automation = automateComplaint(
         severity.severity,
         duplicate.isDuplicate
      );

    const id = nextComplaintId();
    const now = new Date().toISOString();
    const initialStatus: ComplaintStatus = duplicate.isDuplicate ? "Open" : "Assigned";

    const complaint: Complaint = {
      id,
      title: `${finalCategory} — ${body.areaName || routing.areaName}`,
      description: languageResult.normalizedText || rawText || "Civic issue reported via photo upload.",
      category: finalCategory,
      secondaryCategory: classification.secondaryCategory,
      severity: severity.severity,
      priority: automation.priority,
      status: initialStatus,
      isEscalated: false,
      notificationSent: false,
      language: languageResult.language,
      originalText: languageResult.transcript ?? rawText,
      lat: body.lat,
      lng: body.lng,
      areaName: body.areaName || routing.areaName,
      ward: body.ward,
      zone: routing.zone,
      departmentId: routing.primaryDepartmentId,
      serviceTeamId: routing.primaryTeamId,
      secondaryDepartmentId: routing.secondaryDepartmentId,
      aiConfidence: classification.confidence,
      routingReason: routing.reason,
      duplicateOf: duplicate.isDuplicate ? duplicate.matches[0]?.complaintId : undefined,
      privacy,
      imageUrl: body.imageDataUrl || (body.imageName ? `/demo-images/${body.imageName}` : undefined),
      media: [],
      statusHistory: [
        { status: "Open", note: "Complaint received and queued for AI analysis.", timestamp: now },
        {
          status: "Open",
          note: `AI analysis complete: classified as ${finalCategory} (${Math.round(classification.confidence * 100)}% confidence), severity ${severity.severity}.`,
          timestamp: now,
        },
        ...(initialStatus === "Assigned"
          ? [{ status: "Assigned" as ComplaintStatus, note: `Routed to ${routing.primaryTeamName}.`, timestamp: now }]
          : [{ status: "Open" as ComplaintStatus, note: `Possible duplicate of ${duplicate.matches[0]?.complaintId} — held for review.`, timestamp: now }]),
      ],
      reporterName: body.reporterName || "Demo Citizen",
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };

    addComplaint(complaint);

    return NextResponse.json({
      complaint,
      analysis: {
        language: languageResult,
        classification: { ...classification, category: finalCategory },
        severity,
        privacy,
        duplicate,
        routing,
        automation,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing this complaint. Please try again." },
      { status: 500 }
    );
  }
}
