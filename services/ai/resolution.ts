import { AIResolutionResult } from "@/types";
import { seededBool, seededFloat } from "@/lib/deterministic";

export interface VerifyResolutionInput {
  beforeUrl?: string;
  afterUrl?: string;
}

/**
 * verifyResolution()
 *
 * DEMO / MOCK IMPLEMENTATION — "Demo AI Resolution Verification".
 * Real implementation: a vision model comparing before/after imagery
 * (change detection / segmentation diff) to confirm the reported hazard
 * is no longer present.
 *
 * The demo treats "an after photo was supplied" as the main signal and
 * derives a deterministic, mostly-positive confidence score from the
 * filenames so repeated tests are stable.
 */
export function verifyResolution(input: VerifyResolutionInput): AIResolutionResult {
  if (!input.afterUrl) {
    return {
      success: false,
      confidence: 0,
      reason: "No after-resolution photo was supplied; verification could not run.",
    };
  }

  const seed = `${input.beforeUrl ?? "none"}|${input.afterUrl}`;
  const success = seededBool(seed, 0.85);
  const confidence = success
    ? Math.round((0.86 + seededFloat(seed, 0, 0.12)) * 100) / 100
    : Math.round((0.4 + seededFloat(seed, 0, 0.2)) * 100) / 100;

  return {
    success,
    confidence,
    reason: success
      ? "Visual comparison of the before/after photos indicates the reported hazard is no longer present."
      : "The after photo does not clearly show the reported issue resolved; recommend citizen review or department re-inspection.",
  };
}
