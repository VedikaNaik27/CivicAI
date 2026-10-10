// Small deterministic hashing / pseudo-random utilities.
//
// The mock AI services are designed to be *deterministic* given the same
// input (same text/filename/coordinates), so a judge can re-run the same
// test case and get the same result, while still varying sensibly across
// different inputs. This is what "realistic but simulated" AI looks like
// for a datathon MVP — see /services/ai for where these are used.

export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

// Returns a deterministic float in [min, max) seeded by `seed`.
export function seededFloat(seed: string, min = 0, max = 1): number {
  const h = hashString(seed);
  const frac = (h % 100000) / 100000;
  return min + frac * (max - min);
}

export function seededPick<T>(seed: string, options: T[]): T {
  const h = hashString(seed);
  return options[h % options.length];
}

export function seededBool(seed: string, trueProbability = 0.5): boolean {
  return seededFloat(seed) < trueProbability;
}

// Simple word-overlap (Jaccard-like) similarity between two short text
// strings — a stand-in for a text embedding similarity model.
export function textSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
  const setA = norm(a);
  const setB = norm(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}
