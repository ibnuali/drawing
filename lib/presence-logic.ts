/**
 * Pure presence logic extracted for testability.
 * These functions mirror the logic in convex/presence.ts but operate on plain data
 * rather than Convex database contexts.
 */

export const STALE_THRESHOLD_MS = 30_000;

export interface PresenceRecord {
  canvasId: string;
  userId: string;
  userName: string;
  userColor: string;
  pointer?: { x: number; y: number };
  selectedElementIds: string[];
  lastSeen: number;
}

export interface PresenceWithIdle extends PresenceRecord {
  isIdle: boolean;
}

export type PresenceOperation =
  | { type: "upsert"; record: PresenceRecord }
  | { type: "remove"; canvasId: string; userId: string };

/**
 * Applies a sequence of upsert/remove operations to build the presence state
 * for a given canvas. Mirrors the upsert (keyed by canvasId+userId) and delete
 * semantics of convex/presence.ts.
 */
export function applyPresenceOperations(
  operations: PresenceOperation[],
  canvasId: string,
): Map<string, PresenceRecord> {
  const state = new Map<string, PresenceRecord>();

  for (const op of operations) {
    if (op.type === "upsert" && op.record.canvasId === canvasId) {
      state.set(op.record.userId, op.record);
    } else if (op.type === "remove" && op.canvasId === canvasId) {
      state.delete(op.userId);
    }
  }

  return state;
}

/**
 * Annotates presence records with the isIdle flag based on staleness threshold.
 * Mirrors the logic in getByCanvas.
 */
export function annotateIdle(
  records: PresenceRecord[],
  now: number,
): PresenceWithIdle[] {
  return records.map((r) => ({
    ...r,
    isIdle: now - r.lastSeen > STALE_THRESHOLD_MS,
  }));
}

/**
 * Checks that a presence record contains all required display fields.
 */
export function isPresenceComplete(record: PresenceRecord): boolean {
  return (
    typeof record.userName === "string" &&
    record.userName.length > 0 &&
    typeof record.userColor === "string" &&
    record.userColor.length > 0 &&
    Array.isArray(record.selectedElementIds)
  );
}
