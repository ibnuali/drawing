/**
 * Property-based tests for access control logic.
 * Feature: real-time-collaboration
 *
 * Uses fast-check to validate correctness properties from the design document.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canAccessForCollaboration,
  canPerformDestructiveAction,
  type CanvasRecord,
} from "../access-control-logic";

// --- Generators ---

const userIdArb = fc.string({ minLength: 1, maxLength: 30 });

const canvasArb = (ownerId: fc.Arbitrary<string>): fc.Arbitrary<CanvasRecord> =>
  fc.record({
    ownerId,
    collaborationEnabled: fc.option(fc.boolean(), { nil: undefined }),
  });

// --- Property 7: Collaboration access control — enabled ---
// Feature: real-time-collaboration, Property 7: Collaboration access control — enabled
// Validates: Requirements 4.3
describe("Property 7: Collaboration access control — enabled", () => {
  it("for any canvas with collaborationEnabled === true and any authenticated user, getForCollaboration returns the canvas", () => {
    fc.assert(
      fc.property(userIdArb, userIdArb, (ownerId, requestingUserId) => {
        const canvas: CanvasRecord = {
          ownerId,
          collaborationEnabled: true,
        };

        const result = canAccessForCollaboration(canvas, requestingUserId);
        expect(result).not.toBeNull();
        expect(result).toEqual(canvas);
      }),
      { numRuns: 100 },
    );
  });
});

// --- Property 8: Collaboration access control — disabled ---
// Feature: real-time-collaboration, Property 8: Collaboration access control — disabled
// Validates: Requirements 4.4
describe("Property 8: Collaboration access control — disabled", () => {
  it("for any canvas with collaborationEnabled falsy and any non-owner user, getForCollaboration returns null", () => {
    fc.assert(
      fc.property(
        userIdArb,
        userIdArb,
        fc.constantFrom(false, undefined),
        (ownerId, requestingUserId, collabFlag) => {
          // Ensure the requesting user is NOT the owner
          fc.pre(requestingUserId !== ownerId);

          const canvas: CanvasRecord = {
            ownerId,
            collaborationEnabled: collabFlag,
          };

          const result = canAccessForCollaboration(canvas, requestingUserId);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 9: Non-owner restriction on destructive actions ---
// Feature: real-time-collaboration, Property 9: Non-owner restriction on destructive actions
// Validates: Requirements 4.5
describe("Property 9: Non-owner restriction on destructive actions", () => {
  it("for any canvas and any non-owner user, destructive actions are rejected", () => {
    fc.assert(
      fc.property(
        canvasArb(userIdArb),
        userIdArb,
        (canvas, requestingUserId) => {
          // Ensure the requesting user is NOT the owner
          fc.pre(requestingUserId !== canvas.ownerId);

          const allowed = canPerformDestructiveAction(canvas, requestingUserId);
          expect(allowed).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas and its owner, destructive actions are allowed", () => {
    fc.assert(
      fc.property(canvasArb(userIdArb), (canvas) => {
        const allowed = canPerformDestructiveAction(canvas, canvas.ownerId);
        expect(allowed).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
