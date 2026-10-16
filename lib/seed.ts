import { Complaint, ComplaintStatus, IssueCategory, Language, StatusHistoryEntry } from "@/types";
import { DEMO_WARDS, GEOGRAPHIC_AREAS, areaForWard } from "@/lib/reference-data";
import { classifyComplaint } from "@/services/ai/classification";
import { analyzeSeverity } from "@/services/ai/severity";
import { assignDepartment } from "@/services/ai/routing";
import { detectPersonalInformation } from "@/services/ai/privacy";
import { verifyResolution } from "@/services/ai/resolution";
import { seededFloat, seededPick } from "@/lib/deterministic";

interface SeedTemplate {
  category: IssueCategory;
  descriptions: string[];
  imageName: string;
}

const TEMPLATES: SeedTemplate[] = [
  {
    category: "Pothole",
    imageName: "pothole_road_damage.jpg",
    descriptions: [
      "There is a large pothole on the main road causing traffic to swerve dangerously.",
      "Deep pothole near the bus stop, two-wheelers keep getting stuck.",
      "Multiple potholes have formed after the rain near the junction.",
    ],
  },
  {
    category: "Road Damage",
    imageName: "road_damage_cracked.jpg",
    descriptions: [
      "Large stretch of road surface has cracked and is crumbling at the edges.",
      "Road collapse near the culvert, dangerous for vehicles at night.",
    ],
  },
  {
    category: "Streetlight",
    imageName: "streetlight_not_working.jpg",
    descriptions: [
      "The streetlight outside our building has not been working for a week, area is very dark at night.",
      "Lamp post is damaged and leaning after last week's storm.",
      "Street light near the park entrance keeps flickering and switching off.",
    ],
  },
  {
    category: "Garbage",
    imageName: "garbage_overflow_bin.jpg",
    descriptions: [
      "Garbage bin near the market has been overflowing for three days, attracting stray animals.",
      "Illegal dumping of waste on the empty plot next to the school.",
      "Trash collection has been missed twice this week, garbage piling up on the street.",
    ],
  },
  {
    category: "Drainage",
    imageName: "drainage_blocked_chamber.jpg",
    descriptions: [
      "The drain is blocked and water is flooding the road every time it rains.",
      "Open drainage chamber near the footpath is a fall hazard for pedestrians.",
      "Sewage is overflowing onto the street from a blocked manhole.",
    ],
  },
  {
    category: "Water Leakage",
    imageName: "water_pipe_leak.jpg",
    descriptions: [
      "A major water pipeline has burst, wasting a large amount of water and flooding the lane.",
      "Constant leakage from an underground pipe is damaging the road surface.",
    ],
  },
  {
    category: "Flooding",
    imageName: "flooding_waterlogged_road.jpg",
    descriptions: [
      "Road is flooded because the drain is blocked, water level is rising with each rain.",
      "Waterlogging near the underpass makes the road impassable during rains.",
    ],
  },
  {
    category: "Traffic Signal",
    imageName: "traffic_signal_fault.jpg",
    descriptions: [
      "Traffic signal at the main junction has been stuck on red for two days, causing congestion.",
      "The traffic light near the school is not working, unsafe for children crossing.",
    ],
  },
  {
    category: "Fallen Tree",
    imageName: "fallen_tree_branch.jpg",
    descriptions: [
      "A large tree branch fell after the storm and is blocking half the road.",
      "An uprooted tree is leaning dangerously over the footpath.",
    ],
  },
  {
    category: "Unsafe Infrastructure",
    imageName: "unsafe_broken_railing.jpg",
    descriptions: [
      "The footbridge railing is broken, unsafe for pedestrians and children.",
      "Exposed electrical wiring near the bus shelter is a serious safety hazard.",
    ],
  },
];

const STATUS_CYCLE: ComplaintStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Resolved",
  "Resolved",
  "In Progress",
  "Assigned",
  "Open",
];

const LANGUAGE_CYCLE: Language[] = ["English", "English", "English", "Kannada", "English", "Hindi"];

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function buildHistory(status: ComplaintStatus, createdAt: Date): StatusHistoryEntry[] {
  const history: StatusHistoryEntry[] = [
    { status: "Open", note: "Complaint received and queued for AI analysis.", timestamp: createdAt.toISOString() },
  ];
  const step = (offsetHours: number, status: ComplaintStatus, note: string) => {
    const t = new Date(createdAt.getTime() + offsetHours * 3600 * 1000);
    history.push({ status, note, timestamp: t.toISOString() });
  };
  step(0.2, "Open", "AI analysis complete — category, severity and department identified.");
  if (status === "Open") return history;
  step(2, "Assigned", "Routed to responsible service team.");
  if (status === "Assigned") return history;
  step(10, "In Progress", "Service team accepted the complaint and began work.");
  if (status === "In Progress") return history;
  step(48, "Resolution Uploaded", "Department uploaded after-resolution evidence.");
  step(50, "Resolved", "AI resolution verification passed; citizen confirmed the fix.");
  return history;
}

/**
 * generateSeedComplaints()
 *
 * Produces a deterministic set of 40+ demo complaints spanning every
 * category, severity, status, language, ward and department, including a
 * handful of intentional near-duplicates so duplicate detection has real
 * data to find. Uses the SAME mock AI services as the live submission
 * flow, so dashboard numbers stay internally consistent.
 */
export function generateSeedComplaints(): Complaint[] {
  const complaints: Complaint[] = [];
  let counter = 1000;
  const now = new Date("2026-09-19T09:00:00Z");

  let templateIdx = 0;
  let wardIdx = 0;

  const totalToGenerate = 44;

  for (let i = 0; i < totalToGenerate; i++) {
    const template = TEMPLATES[templateIdx % TEMPLATES.length];
    const ward = DEMO_WARDS[wardIdx % DEMO_WARDS.length];
    const area = areaForWard(ward)!;
    const description = seededPick(`${template.category}-${i}`, template.descriptions);
    const language = LANGUAGE_CYCLE[i % LANGUAGE_CYCLE.length];
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];

    counter += 1;
    const id = `CIV-${pad(counter)}`;

    // jitter the coordinates slightly within the ward's demo radius so
    // markers spread naturally across the map instead of stacking exactly.
    const jitterLat = seededFloat(`${id}-lat`, -0.006, 0.006);
    const jitterLng = seededFloat(`${id}-lng`, -0.006, 0.006);
    const lat = area.lat + jitterLat;
    const lng = area.lng + jitterLng;

    const classification = classifyComplaint({ text: description, imageName: template.imageName });
    const severity = analyzeSeverity({ category: classification.category, text: description });
    const routing = assignDepartment({ category: classification.category, ward, areaName: area.areaName });
    const privacy = detectPersonalInformation({ imageName: template.imageName, hasImage: true });

    const createdAt = new Date(now.getTime() - (totalToGenerate - i) * 3 * 3600 * 1000);
    const history = buildHistory(status, createdAt);
    const updatedAt = history[history.length - 1].timestamp;

    const complaint: Complaint = {
      id,
      title: `${classification.category} — ${area.areaName}`,
      description,
      category: classification.category,
      secondaryCategory: classification.secondaryCategory,
      severity: severity.severity,
      priority: "NORMAL",
      status,
      isEscalated: false,
      language,
      originalText: description,
      lat,
      lng,
      areaName: area.areaName,
      ward,
      zone: area.zone,
      departmentId: routing.primaryDepartmentId,
      serviceTeamId: routing.primaryTeamId,
      secondaryDepartmentId: routing.secondaryDepartmentId,
      aiConfidence: classification.confidence,
      routingReason: routing.reason,
      privacy,
      imageUrl: `/demo-images/${template.imageName}`,
      media: [],
      statusHistory: history,
      reporterName: "Demo Citizen",
      isDemo: true,
      createdAt: createdAt.toISOString(),
      updatedAt,
    };

    if (status === "Resolved") {
      const resolutionResult = verifyResolution({
        beforeUrl: complaint.imageUrl,
        afterUrl: `/demo-images/resolved_${template.imageName}`,
      });
      complaint.resolution = {
        beforeUrl: complaint.imageUrl,
        afterUrl: `/demo-images/resolved_${template.imageName}`,
        aiResult: resolutionResult,
        citizenConfirmed: true,
        citizenRespondedAt: updatedAt,
      };
    }

    complaints.push(complaint);

    templateIdx++;
    if (templateIdx % TEMPLATES.length === 0) wardIdx++;
  }

  // Inject a handful of explicit near-duplicate complaints so duplicate
  // detection has guaranteed hits to demo, clustered in Ward 151 potholes.
  const dupArea = GEOGRAPHIC_AREAS[0];
  const dupDescriptions = [
    "Big pothole on the road, cars are avoiding it dangerously.",
    "Pothole near the bus stand keeps getting worse after every rain.",
    "There's a dangerous pothole right at the turning, please fix urgently.",
  ];
  dupDescriptions.forEach((desc, idx) => {
    counter += 1;
    const id = `CIV-${pad(counter)}`;
    const classification = classifyComplaint({ text: desc, imageName: "pothole_road_damage.jpg" });
    const severity = analyzeSeverity({ category: classification.category, text: desc });
    const routing = assignDepartment({
      category: classification.category,
      ward: dupArea.ward,
      areaName: dupArea.areaName,
    });
    const createdAt = new Date(now.getTime() - (3 - idx) * 5 * 3600 * 1000);
    const status: ComplaintStatus = idx === 0 ? "In Progress" : "Open";
    const history = buildHistory(status, createdAt);

    complaints.push({
      id,
      title: `${classification.category} — ${dupArea.areaName}`,
      description: desc,
      category: classification.category,
      severity: severity.severity,
      priority: "NORMAL",
      status,
      isEscalated: false,
      language: "English",
      originalText: desc,
      lat: dupArea.lat + seededFloat(`${id}-lat2`, -0.0009, 0.0009),
      lng: dupArea.lng + seededFloat(`${id}-lng2`, -0.0009, 0.0009),
      areaName: dupArea.areaName,
      ward: dupArea.ward,
      zone: dupArea.zone,
      departmentId: routing.primaryDepartmentId,
      serviceTeamId: routing.primaryTeamId,
      aiConfidence: classification.confidence,
      routingReason: routing.reason,
      privacy: detectPersonalInformation({
        imageName: "pothole_road_damage.jpg",
        hasImage: true,
      }),
      duplicateOf: idx > 0 ? complaints[complaints.length - 3]?.id ?? undefined : undefined,
      imageUrl: "/demo-images/pothole_road_damage.jpg",
      media: [],
      statusHistory: history,
      reporterName: "Demo Citizen",
      isDemo: true,
      createdAt: createdAt.toISOString(),
      updatedAt: history[history.length - 1].timestamp,
    });
  });

  // Fix up duplicateOf references to point at the first of the cluster.
  const masterId = complaints[complaints.length - 3].id;
  complaints[complaints.length - 2].duplicateOf = masterId;
  complaints[complaints.length - 1].duplicateOf = masterId;

  return complaints;
}