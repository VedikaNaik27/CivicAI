import { Complaint } from "@/types";

const DEMO_ESCALATION_MINUTES = 1;
const PRODUCTION_ESCALATION_MINUTES = 24 * 60;

export interface EscalationResult {
  shouldEscalate: boolean;
  reason: string;
  notificationMessage?: string;
}

export function checkEscalation(
  complaint: Complaint,
  demoMode = true
): EscalationResult {
  // Already escalated
  if (complaint.isEscalated) {
    return {
      shouldEscalate: false,
      reason: "Complaint has already been escalated.",
    };
  }

  // Only assigned complaints should be monitored
  if (complaint.status !== "Assigned") {
    return {
      shouldEscalate: false,
      reason: "Complaint is not currently assigned.",
    };
  }

  const thresholdMinutes = demoMode
    ? DEMO_ESCALATION_MINUTES
    : PRODUCTION_ESCALATION_MINUTES;

  const createdAt = new Date(complaint.createdAt).getTime();
  const now = Date.now();

  const ageMinutes = (now - createdAt) / (1000 * 60);

 if (ageMinutes >= thresholdMinutes) {
  return {
    shouldEscalate: true,
    reason: `No action was recorded within the configured ${thresholdMinutes}-minute response window.`,
    notificationMessage: `Complaint ${complaint.id} requires attention. It was automatically escalated because no action was recorded within the configured response window.`,
  };
}

  return {
    shouldEscalate: false,
    reason: `Complaint is still within the ${thresholdMinutes}-minute response window.`,
  };
}