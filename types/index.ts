// CivicAI core domain types
// Kept intentionally close to a Postgres/Supabase-compatible schema
// (see /database/schema.sql) so the mock layer can be swapped for
// real tables without changing consumer code.

export type IssueCategory =
  | "Pothole"
  | "Road Damage"
  | "Streetlight"
  | "Garbage"
  | "Drainage"
  | "Water Leakage"
  | "Flooding"
  | "Traffic Signal"
  | "Fallen Tree"
  | "Unsafe Infrastructure"
  | "Other";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintPriority = "NORMAL" | "MEDIUM" | "HIGH" | "URGENT";

export type ComplaintStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Resolution Uploaded"
  | "Resolved"
  | "Reopened";

export type Language = "English" | "Kannada" | "Hindi";

export type DepartmentName =
  | "Road Maintenance"
  | "Street Lighting"
  | "Waste Management"
  | "Drainage"
  | "Water Supply"
  | "Traffic/Transport"
  | "Parks/Tree Management";

export interface Department {
  id: string;
  name: DepartmentName;
  description: string;
  icon: string;
}

export interface ServiceTeam {
  id: string;
  name: string; // e.g. "Road Team - Ward 151"
  departmentId: string;
  ward: string;
}

export interface GeographicArea {
  ward: string;
  zone: string;
  areaName: string; // human readable neighborhood, e.g. "BTM Layout"
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface RoutingRule {
  id: string;
  category: IssueCategory;
  ward: string;
  departmentId: string;
  teamId: string;
  secondaryDepartmentId?: string;
}

export interface AIClassificationResult {
  category: IssueCategory;
  confidence: number;
  reason: string;
  secondaryCategory?: IssueCategory;
  secondaryReason?: string;
}

export interface AISeverityResult {
  severity: Severity;
  confidence: number;
  reason: string;
  factors: string[];
}

export interface AIPrivacyResult {
  faceDetected: boolean;
  numberPlateDetected: boolean;
  otherSensitiveInfo: string[];
  recommendation: string;
  scanned: boolean;
}

export interface AIDuplicateMatch {
  complaintId: string;
  similarity: number;
  distanceMeters: number;
  sameCategory: boolean;
  reason: string;
}

export interface AIDuplicateResult {
  isDuplicate: boolean;
  matches: AIDuplicateMatch[];
}

export interface AILanguageResult {
  language: Language;
  transcript?: string;
  normalizedText: string;
}

export interface AIRoutingResult {
  ward: string;
  zone: string;
  areaName: string;
  primaryDepartmentId: string;
  primaryDepartmentName: string;
  primaryTeamId: string;
  primaryTeamName: string;
  secondaryDepartmentId?: string;
  secondaryDepartmentName?: string;
  reason: string;
}

export interface AIResolutionResult {
  success: boolean;
  confidence: number;
  reason: string;
}

export interface AIAnalysisBundle {
  language: AILanguageResult;
  classification: AIClassificationResult;
  severity: AISeverityResult;
  privacy: AIPrivacyResult;
  duplicate: AIDuplicateResult;
  routing: AIRoutingResult;
}

export interface ComplaintMedia {
  id: string;
  complaintId: string;
  type: "before" | "after" | "voice";
  url: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  status: ComplaintStatus | string;
  note?: string;
  actor?: string;
  timestamp: string;
}

export interface ResolutionVerification {
  beforeUrl?: string;
  afterUrl?: string;
  aiResult?: AIResolutionResult;
  citizenConfirmed?: boolean;
  citizenRespondedAt?: string;
}

export interface Complaint {
  id: string; // CIV-XXXX
  title: string;
  description: string;
  category: IssueCategory;
  secondaryCategory?: IssueCategory;
  severity: Severity;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  isEscalated: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  notificationSent?: boolean;
  notificationMessage?: string;
  language: Language;
  originalText?: string;

  lat: number;
  lng: number;
  areaName: string;
  ward: string;
  zone: string;

  departmentId: string;
  serviceTeamId: string;
  secondaryDepartmentId?: string;

  aiConfidence: number;
  routingReason: string;
  duplicateOf?: string;

  privacy: AIPrivacyResult;

  imageUrl?: string;
  media: ComplaintMedia[];

  statusHistory: StatusHistoryEntry[];
  resolution?: ResolutionVerification;

  reporterName?: string;
  isDemo: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface DemoUser {
  email: string;
  role: "admin" | "department" | "citizen";
  name: string;
  departmentId?: string;
}

export type LocationMethod = "gps" | "map" | "address" | "demo";

export interface LocationInput {
  method: LocationMethod;
  lat: number;
  lng: number;
  areaName: string;
  ward: string;
  zone: string;
  address?: string;
}
