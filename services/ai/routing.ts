import { AIRoutingResult, IssueCategory } from "@/types";
import {
  CATEGORY_DEPARTMENT_MAP,
  areaForWard,
  departmentByName,
  findRoutingRule,
  teamById,
} from "@/lib/reference-data";

export interface AssignDepartmentInput {
  category: IssueCategory;
  ward: string;
  areaName: string;
}

/**
 * assignDepartment()
 *
 * THE MOST IMPORTANT FEATURE: geographic routing.
 *
 *   AI-detected category  +  geographic location (ward/zone)
 *   =========================================================
 *                  responsible service team
 *
 * This is intentionally NOT "nearest department" — it looks up the
 * (category, ward) pair in the routing table (/lib/reference-data.ts),
 * which is what lets the SAME issue category route to a DIFFERENT team
 * when only the location changes (see judge demo #2).
 */
export function assignDepartment(input: AssignDepartmentInput): AIRoutingResult {
  const rule = findRoutingRule(input.category, input.ward);
  const area = areaForWard(input.ward);
  const mapping = CATEGORY_DEPARTMENT_MAP[input.category];

  if (!rule || !area) {
    // Should not happen given the demo ward set, but fail safe to the
    // general Road Maintenance / manual-triage path rather than crashing.
    const fallbackDept = departmentByName("Road Maintenance");
    return {
      ward: input.ward,
      zone: "Unassigned Zone",
      areaName: input.areaName,
      primaryDepartmentId: fallbackDept.id,
      primaryDepartmentName: fallbackDept.name,
      primaryTeamId: "unassigned",
      primaryTeamName: "Manual Triage Queue",
      reason:
        "No routing rule matched this ward; queued for manual triage by an administrator.",
    };
  }

  const team = teamById(rule.teamId)!;
  const primaryDept = departmentByName(mapping.primary);
  const secondaryDept = mapping.secondary ? departmentByName(mapping.secondary) : undefined;

  const reason = secondaryDept
    ? `AI classified the issue as "${input.category}", which primarily falls under ${primaryDept.name} with ${secondaryDept.name} collaborating. The submitted location (${input.areaName}) falls within ${input.ward}'s (${area.zone}) service area, so it was routed to ${team.name}.`
    : `AI classified the issue as "${input.category}" and the submitted location (${input.areaName}) falls within ${input.ward}'s (${area.zone}) ${primaryDept.name.toLowerCase()} service area, so it was routed to ${team.name}.`;

  return {
    ward: input.ward,
    zone: area.zone,
    areaName: input.areaName,
    primaryDepartmentId: primaryDept.id,
    primaryDepartmentName: primaryDept.name,
    primaryTeamId: team.id,
    primaryTeamName: team.name,
    secondaryDepartmentId: secondaryDept?.id,
    secondaryDepartmentName: secondaryDept?.name,
    reason,
  };
}
