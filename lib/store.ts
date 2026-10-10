import { Complaint } from "@/types";
import { generateSeedComplaints } from "@/lib/seed";

/**
 * DEMO MODE in-memory data store.
 *
 * The project structure and Complaint type mirror a normalized
 * Postgres/Supabase schema (see /database/schema.sql), but for this
 * datathon MVP `DEMO_MODE=true` uses a process-memory store instead of a
 * real database so the app runs anywhere with zero external services and
 * zero paid APIs. Swapping this module for real Supabase/Postgres calls
 * (same function signatures) is the only change needed to go from demo to
 * production storage — see README "How to replace the demo store".
 *
 * `globalThis` is used to survive Next.js dev-server hot-module-reloads.
 */

interface StoreShape {
  complaints: Complaint[];
  counter: number;
}

const globalForStore = globalThis as unknown as { __civicaiStore?: StoreShape };

function initStore(): StoreShape {
  const seeded = generateSeedComplaints();
  const highestId = seeded.reduce((max, c) => {
    const n = parseInt(c.id.replace("CIV-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 1000);
  return { complaints: seeded, counter: highestId };
}

function getStore(): StoreShape {
  if (!globalForStore.__civicaiStore) {
    globalForStore.__civicaiStore = initStore();
  }
  return globalForStore.__civicaiStore;
}

export function nextComplaintId(): string {
  const store = getStore();
  store.counter += 1;
  return `CIV-${String(store.counter).padStart(4, "0")}`;
}

export function getAllComplaints(): Complaint[] {
  return [...getStore().complaints].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getComplaintById(id: string): Complaint | undefined {
  return getStore().complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function addComplaint(complaint: Complaint): Complaint {
  getStore().complaints.unshift(complaint);
  return complaint;
}

export function updateComplaint(id: string, patch: Partial<Complaint>): Complaint | undefined {
  const store = getStore();
  const idx = store.complaints.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  store.complaints[idx] = {
    ...store.complaints[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return store.complaints[idx];
}

export function resetStore(): void {
  globalForStore.__civicaiStore = initStore();
}
