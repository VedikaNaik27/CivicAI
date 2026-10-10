import { AIPrivacyResult } from "@/types";
import { seededBool } from "@/lib/deterministic";

export interface DetectPersonalInformationInput {
  imageName?: string;
  hasImage: boolean;
}

/**
 * detectPersonalInformation()
 *
 * DEMO / MOCK IMPLEMENTATION.
 * Real implementation: an on-device or server-side face-detection model
 * (e.g. a lightweight CV face detector) and a license-plate OCR/detector,
 * run over the actual image bytes before the photo is ever shown publicly.
 *
 * The demo deterministically derives a plausible result from the image
 * filename so judges can reliably test both branches, e.g. an image named
 * "pothole_with_car.jpg" will trigger a simulated number-plate detection.
 */
export function detectPersonalInformation(input: DetectPersonalInformationInput): AIPrivacyResult {
  if (!input.hasImage) {
    return {
      faceDetected: false,
      numberPlateDetected: false,
      otherSensitiveInfo: [],
      recommendation: "No image supplied — privacy scan skipped.",
      scanned: false,
    };
  }

  const name = (input.imageName ?? "photo").toLowerCase();
  const seed = name;

  const mentionsPerson = /face|person|selfie|people|man|woman|child/.test(name);
  const mentionsVehicle = /car|vehicle|bike|plate|scooter|auto/.test(name);

  const faceDetected = mentionsPerson || seededBool(`${seed}-face`, 0.18);
  const numberPlateDetected = mentionsVehicle || seededBool(`${seed}-plate`, 0.22);

  const otherSensitiveInfo: string[] = [];
  if (seededBool(`${seed}-doc`, 0.06)) otherSensitiveInfo.push("Possible readable document/signage with personal details");

  const anyDetected = faceDetected || numberPlateDetected || otherSensitiveInfo.length > 0;

  return {
    faceDetected,
    numberPlateDetected,
    otherSensitiveInfo,
    recommendation: anyDetected
      ? "Blur sensitive regions before displaying this complaint publicly."
      : "No sensitive personal information detected. Safe to display as-is.",
    scanned: true,
  };
}
