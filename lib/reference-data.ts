import {
  Department,
  DepartmentName,
  GeographicArea,
  IssueCategory,
  RoutingRule,
  ServiceTeam,
} from "@/types";

// ---------------------------------------------------------------------------
// DEMO GEOGRAPHIC DATA
// This is fictional demo geographic data created for the CivicAI datathon
// prototype. It is NOT sourced from, and must not be presented as, an
// official government geographic dataset.
// ---------------------------------------------------------------------------

export const DEMO_WARDS = ["Ward 151", "Ward 152", "Ward 153", "Ward 154"] as const;

export const GEOGRAPHIC_AREAS: GeographicArea[] = [
  { ward: "Ward 151", zone: "South Zone", areaName: "BTM Layout", lat: 12.9166, lng: 77.6101, radiusMeters: 1400 },
  { ward: "Ward 152", zone: "South Zone", areaName: "Jayanagar", lat: 12.9308, lng: 77.5838, radiusMeters: 1400 },
  { ward: "Ward 153", zone: "East Zone", areaName: "Indiranagar", lat: 12.9719, lng: 77.6412, radiusMeters: 1400 },
  { ward: "Ward 154", zone: "East Zone", areaName: "Whitefield", lat: 12.9698, lng: 77.7500, radiusMeters: 1800 },
];

export const DEPARTMENTS: Department[] = [
  { id: "dept-road", name: "Road Maintenance", description: "Potholes, road surface damage and structural road repair", icon: "Construction" },
  { id: "dept-light", name: "Street Lighting", description: "Streetlight outages, damaged poles and lighting infrastructure", icon: "Lightbulb" },
  { id: "dept-waste", name: "Waste Management", description: "Garbage overflow, illegal dumping and collection scheduling", icon: "Trash2" },
  { id: "dept-drain", name: "Drainage", description: "Blocked drains, stormwater management and flooding response", icon: "Waves" },
  { id: "dept-water", name: "Water Supply", description: "Water leakage, pipeline bursts and supply disruptions", icon: "Droplets" },
  { id: "dept-traffic", name: "Traffic/Transport", description: "Traffic signal faults, signage and road-safety hazards", icon: "TrafficCone" },
  { id: "dept-parks", name: "Parks/Tree Management", description: "Fallen trees, park maintenance and green-cover hazards", icon: "TreePine" },
];

export function departmentByName(name: DepartmentName): Department {
  const d = DEPARTMENTS.find((d) => d.name === name);
  if (!d) throw new Error(`Unknown department: ${name}`);
  return d;
}

export function departmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

// One team per department per ward
export const SERVICE_TEAMS: ServiceTeam[] = DEPARTMENTS.flatMap((dept) =>
  DEMO_WARDS.map((ward) => {
    const shortNameMap: Record<string, string> = {
      "Road Maintenance": "Road Team",
      "Street Lighting": "Lighting Team",
      "Waste Management": "Waste Team",
      Drainage: "Drainage Team",
      "Water Supply": "Water Team",
      "Traffic/Transport": "Traffic Team",
      "Parks/Tree Management": "Parks Team",
    };
    return {
      id: `team-${dept.id}-${ward.replace(/\s+/g, "").toLowerCase()}`,
      name: `${shortNameMap[dept.name]} - ${ward}`,
      departmentId: dept.id,
      ward,
    };
  })
);

export function teamById(id: string): ServiceTeam | undefined {
  return SERVICE_TEAMS.find((t) => t.id === id);
}

export function teamFor(departmentId: string, ward: string): ServiceTeam | undefined {
  return SERVICE_TEAMS.find((t) => t.departmentId === departmentId && t.ward === ward);
}

// Category -> primary department (+ optional secondary department) mapping.
// This is the "brain" behind geographic routing: AI decides WHAT the issue
// is, this table (keyed also by ward, so it can vary per-ward if needed)
// decides WHO owns it.
export const CATEGORY_DEPARTMENT_MAP: Record<
  IssueCategory,
  { primary: DepartmentName; secondary?: DepartmentName }
> = {
  Pothole: { primary: "Road Maintenance" },
  "Road Damage": { primary: "Road Maintenance" },
  Streetlight: { primary: "Street Lighting" },
  Garbage: { primary: "Waste Management" },
  Drainage: { primary: "Drainage", secondary: "Road Maintenance" },
  "Water Leakage": { primary: "Water Supply" },
  Flooding: { primary: "Drainage", secondary: "Road Maintenance" },
  "Traffic Signal": { primary: "Traffic/Transport" },
  "Fallen Tree": { primary: "Parks/Tree Management", secondary: "Road Maintenance" },
  "Unsafe Infrastructure": { primary: "Road Maintenance", secondary: "Traffic/Transport" },
  Other: { primary: "Road Maintenance" },
};

// Fully materialized routing table (category x ward), matching the
// "Department Routing Table" spec. Generated from CATEGORY_DEPARTMENT_MAP
// so every (category, ward) pair has an explicit, inspectable rule.
export const ROUTING_TABLE: RoutingRule[] = (
  Object.keys(CATEGORY_DEPARTMENT_MAP) as IssueCategory[]
).flatMap((category) =>
  DEMO_WARDS.map((ward) => {
    const mapping = CATEGORY_DEPARTMENT_MAP[category];
    const primaryDept = departmentByName(mapping.primary);
    const secondaryDept = mapping.secondary ? departmentByName(mapping.secondary) : undefined;
    const team = teamFor(primaryDept.id, ward)!;
    return {
      id: `route-${category.replace(/\s+/g, "").toLowerCase()}-${ward.replace(/\s+/g, "").toLowerCase()}`,
      category,
      ward,
      departmentId: primaryDept.id,
      teamId: team.id,
      secondaryDepartmentId: secondaryDept?.id,
    };
  })
);

export function findRoutingRule(category: IssueCategory, ward: string): RoutingRule | undefined {
  return ROUTING_TABLE.find((r) => r.category === category && r.ward === ward);
}

export function areaForWard(ward: string): GeographicArea | undefined {
  return GEOGRAPHIC_AREAS.find((a) => a.ward === ward);
}

// Haversine distance in meters between two lat/lng points.
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Resolve the nearest demo geographic area (and therefore ward/zone) to an
// arbitrary lat/lng, e.g. from "Use My Location" or "Select on Map".
export function resolveAreaFromCoordinates(lat: number, lng: number): GeographicArea {
  let nearest = GEOGRAPHIC_AREAS[0];
  let minDist = Infinity;
  for (const area of GEOGRAPHIC_AREAS) {
    const d = distanceMeters(lat, lng, area.lat, area.lng);
    if (d < minDist) {
      minDist = d;
      nearest = area;
    }
  }
  return nearest;
}
