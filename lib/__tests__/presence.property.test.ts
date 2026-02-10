/**
 * Property-based tests for presence logic.
 * Feature: real-time-collaboration
 *
 * Uses fast-check to validate correctness properties from the design document.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  applyPresenceOperations,
  annotateIdle,
  isPresenceComplete,
  STALE_THRESHOLD_MS,
  type PresenceRecord,
  type PresenceOperation,
} from "../presence-logic";

// --- Generators ---

const CANVAS_ID = "canvas_001";

const presenceRecordArb = (canvasId: string): fc.Arbitrary<PresenceRecord> =>
  fc.record({
    canvasId: fc.constant(canvasId),
    userId: fc.string({ minLength: 1, maxLength: 20 }),
    userName: fc.string({ minLength: 1, maxLength: 30 }),
    userColor: fc
      .array(fc.constantFrom(..."0123456789abcdef"), {
        minLength: 6,
        maxLength: 6,
      })
      .map((chars) => `#${chars.join("")}`),
    pointer: fc.option(
      fc.record({
        x: fc.double({ min: -1e4, max: 1e4, noNaN: true }),
        y: fc.double({ min: -1e4, max: 1e4, noNaN: true }),
      }),
      { nil: undefined },
    ),
    selectedElementIds: fc.array(fc.string({ minLength: 1, maxLength: 10 }), {
      maxLength: 5,
    }),
    lastSeen: fc.integer({ min: 0, max: Date.now() + 1_000_000 }),
  });

const presenceOperationArb = (
  canvasId: string,
): fc.Arbitrary<PresenceOperation> =>
  fc.oneof(
    presenceRecordArb(canvasId).map((record) => ({
      type: "upsert" as const,
      record,
    })),
    fc.string({ minLength: 1, maxLength: 20 }).map((userId) => ({
      type: "remove" as const,
      canvasId,
      userId,
    })),
  );

// --- Property 1: Presence list reflects active records ---
// Feature: real-time-collaboration, Property 1: Presence list reflects active records
// Validates: Requirements 1.4, 5.1, 5.3
describe("Property 1: Presence list reflects active records", () => {
  it("for any sequence of upsert/remove operations, the resulting presence list contains exactly the users with active (non-deleted) records", () => {
    fc.assert(
      fc.property(
        fc.array(presenceOperationArb(CANVAS_ID), {
          minLength: 1,
          maxLength: 50,
        }),
        (operations) => {
          const state = applyPresenceOperations(operations, CANVAS_ID);
          const resultUserIds = new Set(state.keys());

          // Replay operations manually to compute expected state
          const expected = new Map<string, PresenceRecord>();
          for (const op of operations) {
            if (op.type === "upsert" && op.record.canvasId === CANVAS_ID) {
              expected.set(op.record.userId, op.record);
            } else if (op.type === "remove" && op.canvasId === CANVAS_ID) {
              expected.delete(op.userId);
            }
          }
          const expectedUserIds = new Set(expected.keys());

          // The set of user IDs in the result must match exactly
          expect(resultUserIds).toEqual(expectedUserIds);

          // Each record in the result must match the last upserted data for that user
          for (const [userId, record] of state) {
            expect(record).toEqual(expected.get(userId));
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 2: Presence data completeness ---
// Feature: real-time-collaboration, Property 2: Presence data completeness
// Validates: Requirements 2.1, 2.3
describe("Property 2: Presence data completeness", () => {
  it("for any presence record created via upsert, the record contains userName, userColor, and selectedElementIds", () => {
    fc.assert(
      fc.property(presenceRecordArb(CANVAS_ID), (record) => {
        // Simulate an upsert then check completeness
        const state = applyPresenceOperations(
          [{ type: "upsert", record }],
          CANVAS_ID,
        );
        const stored = state.get(record.userId);
        expect(stored).toBeDefined();
        expect(isPresenceComplete(stored!)).toBe(true);

        // Verify specific fields exist and have correct types
        expect(typeof stored!.userName).toBe("string");
        expect(stored!.userName.length).toBeGreaterThan(0);
        expect(typeof stored!.userColor).toBe("string");
        expect(stored!.userColor.length).toBeGreaterThan(0);
        expect(Array.isArray(stored!.selectedElementIds)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

// --- Property 3: Idle detection by staleness threshold ---
// Feature: real-time-collaboration, Property 3: Idle detection by staleness threshold
// Validates: Requirements 2.4
describe("Property 3: Idle detection by staleness threshold", () => {
  it("for any presence record and reference timestamp, isIdle is true iff (now - lastSeen) > 30 seconds", () => {
    fc.assert(
      fc.property(
        presenceRecordArb(CANVAS_ID),
        fc.integer({ min: 0, max: Date.now() + 1_000_000 }),
        (record, now) => {
          const annotated = annotateIdle([record], now);
          expect(annotated).toHaveLength(1);

          const diff = now - record.lastSeen;
          const expectedIdle = diff > STALE_THRESHOLD_MS;
          expect(annotated[0].isIdle).toBe(expectedIdle);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any record with lastSeen exactly at the threshold boundary, isIdle is false", () => {
    fc.assert(
      fc.property(presenceRecordArb(CANVAS_ID), (record) => {
        // Set now to exactly lastSeen + threshold (boundary case)
        const now = record.lastSeen + STALE_THRESHOLD_MS;
        const annotated = annotateIdle([record], now);
        // diff === STALE_THRESHOLD_MS, which is NOT > threshold, so isIdle should be false
        expect(annotated[0].isIdle).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
