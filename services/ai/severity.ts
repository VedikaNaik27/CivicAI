import { AISeverityResult, IssueCategory, Severity } from "@/types";
import { seededFloat } from "@/lib/deterministic";

export interface AnalyzeSeverityInput {
  category: IssueCategory;
  text?: string;
}

// Baseline severity per category, reflecting typical public-safety impact.
// A real model would combine a vision model's damage assessment with an
// NLP risk classifier; this table + keyword escalation is the demo stand-in.
const BASE_SEVERITY: Record<IssueCategory, Severity> = {
  Pothole: "MEDIUM",
  "Road Damage": "MEDIUM",
  Streetlight: "LOW",
  Garbage: "LOW",
  Drainage: "MEDIUM",
  "Water Leakage": "MEDIUM",
  Flooding: "HIGH",
  "Traffic Signal": "HIGH",
  "Fallen Tree": "HIGH",
  "Unsafe Infrastructure": "HIGH",
  Other: "LOW",
};

const ESCALATION_KEYWORDS: { keywords: string[]; bump: number; factor: string }[] = [
  { keywords: ["large", "huge", "big", "deep", "major"], bump: 1, factor: "Extent of damage described as large/major" },
  { keywords: ["accident", "injur", "danger", "fatal", "hit"], bump: 2, factor: "Language suggests risk of injury or an incident has occurred" },
  { keywords: ["block", "blocking", "obstruct"], bump: 1, factor: "Issue obstructs the road or right of way" },
  { keywords: ["school", "hospital", "children", "elderly"], bump: 1, factor: "Proximity to a sensitive public location (school/hospital)" },
  { keywords: ["night", "dark", "visibility"], bump: 1, factor: "Reduced visibility / nighttime safety risk" },
  { keywords: ["overflow", "sewage", "contamina"], bump: 1, factor: "Environmental / public-health risk from overflow or contamination" },
];

const SEVERITY_ORDER: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function analyzeSeverity(input: AnalyzeSeverityInput): AISeverityResult {
  const text = (input.text ?? "").toLowerCase();
  let level = SEVERITY_ORDER.indexOf(BASE_SEVERITY[input.category]);
  const factors: string[] = [`Base risk profile for category "${input.category}"`];

  for (const rule of ESCALATION_KEYWORDS) {
    if (rule.keywords.some((k) => text.includes(k))) {
      level = Math.min(SEVERITY_ORDER.length - 1, level + rule.bump);
      factors.push(rule.factor);
    }
  }

  const severity = SEVERITY_ORDER[level];
  const seed = `${input.category}|${input.text ?? ""}`;
  const confidence = Math.min(0.99, Math.round((0.86 + seededFloat(seed, -0.06, 0.08)) * 100) / 100);

  const reasonMap: Record<Severity, string> = {
    LOW: "Limited immediate public-safety or obstruction risk was identified.",
    MEDIUM: "Moderate risk to road users or amenity; scheduled maintenance recommended.",
    HIGH: "Significant safety, obstruction or environmental risk may affect multiple citizens.",
    CRITICAL: "Immediate public-safety hazard requiring urgent response.",
  };

  return {
    severity,
    confidence,
    reason: reasonMap[severity],
    factors,
  };
}
