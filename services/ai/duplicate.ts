import { AIDuplicateMatch, AIDuplicateResult, Complaint, IssueCategory } from "@/types";
import { distanceMeters } from "@/lib/reference-data";
import { textSimilarity } from "@/lib/deterministic";

export interface DetectDuplicateInput {
  category: IssueCategory;
  description: string;
  lat: number;
  lng: number;
  imageName?: string;
}

const PROXIMITY_THRESHOLD_M = 250;
const SIMILARITY_THRESHOLD = 0.6;

/**
 * detectDuplicate()
 *
 * Compares a new complaint against existing open complaints using:
 *  - geographic proximity (haversine distance)
 *  - issue category match
 *  - text-description similarity (word-overlap; a real system uses
 *    sentence embeddings + a vector DB, see FUTURE_AI.md)
 *  - image filename similarity, as a stand-in for perceptual image hashing
 *
 * Returns the best matches above threshold, ranked by combined similarity.
 */
export function detectDuplicate(
  input: DetectDuplicateInput,
  existing: Complaint[]
): AIDuplicateResult {
  const candidates = existing.filter((c) => c.status !== "Resolved");

  const matches: AIDuplicateMatch[] = [];

  for (const c of candidates) {
    const dist = distanceMeters(input.lat, input.lng, c.lat, c.lng);
    if (dist > PROXIMITY_THRESHOLD_M * 2) continue;

    const sameCategory = c.category === input.category;
    const textSim = textSimilarity(input.description, c.description);
    const imageSim =
      input.imageName && c.imageUrl && input.imageName.toLowerCase() === c.imageUrl.toLowerCase()
        ? 1
        : 0;

    const proximityScore = Math.max(0, 1 - dist / (PROXIMITY_THRESHOLD_M * 2));
    const categoryScore = sameCategory ? 1 : 0.15;

    const combined =
      proximityScore * 0.45 + categoryScore * 0.3 + textSim * 0.2 + imageSim * 0.05;

    if (combined >= SIMILARITY_THRESHOLD && dist <= PROXIMITY_THRESHOLD_M * 1.6) {
      matches.push({
        complaintId: c.id,
        similarity: Math.round(Math.min(0.99, combined) * 100) / 100,
        distanceMeters: Math.round(dist),
        sameCategory,
        reason: `${Math.round(dist)}m away, ${sameCategory ? "same" : "different"} issue category, ${Math.round(
          textSim * 100
        )}% description overlap.`,
      });
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);

  return {
    isDuplicate: matches.length > 0,
    matches: matches.slice(0, 3),
  };
}
