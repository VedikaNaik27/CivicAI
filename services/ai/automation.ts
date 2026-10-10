import { ComplaintPriority, Severity } from "@/types";

export interface AIAutomationResult {
  priority: ComplaintPriority;
  reason: string;
  actions: string[];
}

export function automateComplaint(
  severity: Severity,
  isDuplicate: boolean
): AIAutomationResult {
  if (isDuplicate) {
    return {
      priority: "NORMAL",
      reason: "Possible duplicate detected, so the complaint is held for review.",
      actions: [
        "Duplicate review required",
        "Do not create a new field assignment",
      ],
    };
  }

  switch (severity) {
    case "CRITICAL":
      return {
        priority: "URGENT",
        reason: "Critical civic issue requires immediate attention.",
        actions: [
          "Mark as urgent",
          "Prioritize for immediate response",
          "Notify responsible team",
        ],
      };

    case "HIGH":
      return {
        priority: "HIGH",
        reason: "High-severity civic issue should be handled with elevated priority.",
        actions: [
          "Mark as high priority",
          "Prioritize responsible team",
        ],
      };

    case "MEDIUM":
      return {
        priority: "MEDIUM",
        reason: "Issue requires normal departmental attention.",
        actions: [
          "Assign to responsible team",
          "Track through dashboard",
        ],
      };

    default:
      return {
        priority: "NORMAL",
        reason: "Low-severity issue can follow the standard civic workflow.",
        actions: [
          "Assign to responsible team",
          "Track through dashboard",
        ],
      };
  }
}