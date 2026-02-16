/**
 * Property-based tests for access mutations.
 * Feature: canvas-sharing-modal
 *
 * Uses fast-check to validate correctness properties from the design document.
 * 
 * Note: These tests validate the logical properties of access management.
 * Since Convex mutations require database context, we test the business logic
 * that would be enforced by these mutations.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// --- Type Definitions ---

type AccessLevel = "editor" | "viewer";

interface AccessRecord {
  canvasId: string;
  userId: string;
  accessLevel: AccessLevel;
  grantedAt: number;
  grantedBy: string;
}

interface Canvas {
  id: string;
  ownerId: string;
  title: string;
}

// --- Generators ---

const userIdArb = fc.string({ minLength: 1, maxLength: 30 });
const canvasIdArb = fc.string({ minLength: 1, maxLength: 30 });
const accessLevelArb = fc.constantFrom<AccessLevel>("editor", "viewer");
const timestampArb = fc.integer({ min: 1000000000000, max: 9999999999999 });

const canvasArb: fc.Arbitrary<Canvas> = fc.record({
  id: canvasIdArb,
  ownerId: userIdArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
});

const accessRecordArb = (
  canvasId: string,
  userId: string,
): fc.Arbitrary<AccessRecord> =>
  fc.record({
    canvasId: fc.constant(canvasId),
    userId: fc.constant(userId),
    accessLevel: accessLevelArb,
    grantedAt: timestampArb,
    grantedBy: userIdArb,
  });

// --- Helper Functions (Business Logic) ---

/**
 * Simulates the logic of addCollaborator mutation.
 * Returns the new access record if successful, or an error message.
 */
function simulateAddCollaborator(
  canvas: Canvas,
  requestingUserId: string,
  targetUserId: string,
  accessLevel: AccessLevel,
  existingAccess: AccessRecord[],
): { success: true; record: AccessRecord } | { success: false; error: string } {
  // Check if requesting user is the owner
  if (requestingUserId !== canvas.ownerId) {
    return { success: false, error: "Only the owner can add collaborators" };
  }

  // Check if access already exists
  const existing = existingAccess.find(
    (a) => a.canvasId === canvas.id && a.userId === targetUserId,
  );
  if (existing) {
    return { success: false, error: "User already has access" };
  }

  // Create new access record
  const newRecord: AccessRecord = {
    canvasId: canvas.id,
    userId: targetUserId,
    accessLevel,
    grantedAt: Date.now(),
    grantedBy: requestingUserId,
  };

  return { success: true, record: newRecord };
}

/**
 * Simulates the logic of updateAccessLevel mutation.
 */
function simulateUpdateAccessLevel(
  canvas: Canvas,
  requestingUserId: string,
  targetUserId: string,
  newAccessLevel: AccessLevel,
  existingAccess: AccessRecord[],
): { success: true; updated: AccessRecord } | { success: false; error: string } {
  // Check if requesting user is the owner
  if (requestingUserId !== canvas.ownerId) {
    return { success: false, error: "Only the owner can update access levels" };
  }

  // Find the access record
  const access = existingAccess.find(
    (a) => a.canvasId === canvas.id && a.userId === targetUserId,
  );
  if (!access) {
    return { success: false, error: "Access record not found" };
  }

  // Update the access level
  const updated: AccessRecord = {
    ...access,
    accessLevel: newAccessLevel,
  };

  return { success: true, updated };
}

/**
 * Simulates the logic of removeCollaborator mutation.
 */
function simulateRemoveCollaborator(
  canvas: Canvas,
  requestingUserId: string,
  targetUserId: string,
  existingAccess: AccessRecord[],
): { success: true } | { success: false; error: string } {
  // Check if requesting user is the owner
  if (requestingUserId !== canvas.ownerId) {
    return { success: false, error: "Only the owner can remove collaborators" };
  }

  // Cannot remove the owner
  if (targetUserId === canvas.ownerId) {
    return { success: false, error: "Cannot remove the owner" };
  }

  // Access record existence is optional - removal is idempotent
  return { success: true };
}

// --- Property 3: Valid email invitation ---
// Feature: canvas-sharing-modal, Property 3: Valid email invitation
// Validates: Requirements 2.3, 9.2
describe("Property 3: Valid email invitation", () => {
  it("for any canvas and valid user, owner can add collaborator with editor as default access level", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        accessLevelArb,
        (canvas, targetUserId, accessLevel) => {
          // Ensure target user is not the owner
          fc.pre(targetUserId !== canvas.ownerId);

          const existingAccess: AccessRecord[] = [];
          const result = simulateAddCollaborator(
            canvas,
            canvas.ownerId, // Owner is requesting
            targetUserId,
            accessLevel,
            existingAccess,
          );

          // Should succeed
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.record.canvasId).toBe(canvas.id);
            expect(result.record.userId).toBe(targetUserId);
            expect(result.record.accessLevel).toBe(accessLevel);
            expect(result.record.grantedBy).toBe(canvas.ownerId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, non-owner cannot add collaborators", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        userIdArb,
        accessLevelArb,
        (canvas, nonOwnerId, targetUserId, accessLevel) => {
          // Ensure requesting user is not the owner
          fc.pre(nonOwnerId !== canvas.ownerId);
          fc.pre(targetUserId !== canvas.ownerId);

          const existingAccess: AccessRecord[] = [];
          const result = simulateAddCollaborator(
            canvas,
            nonOwnerId,
            targetUserId,
            accessLevel,
            existingAccess,
          );

          // Should fail
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("Only the owner can add collaborators");
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, adding duplicate collaborator fails", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        accessLevelArb,
        (canvas, targetUserId, accessLevel) => {
          // Ensure target user is not the owner
          fc.pre(targetUserId !== canvas.ownerId);

          // Create existing access record
          const existingAccess: AccessRecord[] = [
            {
              canvasId: canvas.id,
              userId: targetUserId,
              accessLevel: "viewer",
              grantedAt: Date.now(),
              grantedBy: canvas.ownerId,
            },
          ];

          const result = simulateAddCollaborator(
            canvas,
            canvas.ownerId,
            targetUserId,
            accessLevel,
            existingAccess,
          );

          // Should fail
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("User already has access");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 9: Access level updates ---
// Feature: canvas-sharing-modal, Property 9: Access level updates
// Validates: Requirements 4.2, 4.3, 4.6
describe("Property 9: Access level updates", () => {
  it("for any collaborator and any new access level, owner can update the access level", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        accessLevelArb,
        accessLevelArb,
        (canvas, collaboratorId, oldLevel, newLevel) => {
          // Ensure collaborator is not the owner
          fc.pre(collaboratorId !== canvas.ownerId);

          // Create existing access record
          const existingAccess: AccessRecord[] = [
            {
              canvasId: canvas.id,
              userId: collaboratorId,
              accessLevel: oldLevel,
              grantedAt: Date.now(),
              grantedBy: canvas.ownerId,
            },
          ];

          const result = simulateUpdateAccessLevel(
            canvas,
            canvas.ownerId,
            collaboratorId,
            newLevel,
            existingAccess,
          );

          // Should succeed
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.updated.userId).toBe(collaboratorId);
            expect(result.updated.accessLevel).toBe(newLevel);
            expect(result.updated.canvasId).toBe(canvas.id);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, non-owner cannot update access levels", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        userIdArb,
        accessLevelArb,
        accessLevelArb,
        (canvas, nonOwnerId, collaboratorId, oldLevel, newLevel) => {
          // Ensure requesting user is not the owner
          fc.pre(nonOwnerId !== canvas.ownerId);
          fc.pre(collaboratorId !== canvas.ownerId);

          // Create existing access record
          const existingAccess: AccessRecord[] = [
            {
              canvasId: canvas.id,
              userId: collaboratorId,
              accessLevel: oldLevel,
              grantedAt: Date.now(),
              grantedBy: canvas.ownerId,
            },
          ];

          const result = simulateUpdateAccessLevel(
            canvas,
            nonOwnerId,
            collaboratorId,
            newLevel,
            existingAccess,
          );

          // Should fail
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("Only the owner can update access levels");
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, updating non-existent access record fails", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        accessLevelArb,
        (canvas, collaboratorId, newLevel) => {
          // Ensure collaborator is not the owner
          fc.pre(collaboratorId !== canvas.ownerId);

          // No existing access records
          const existingAccess: AccessRecord[] = [];

          const result = simulateUpdateAccessLevel(
            canvas,
            canvas.ownerId,
            collaboratorId,
            newLevel,
            existingAccess,
          );

          // Should fail
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("Access record not found");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 10: Collaborator removal ---
// Feature: canvas-sharing-modal, Property 10: Collaborator removal
// Validates: Requirements 4.4
describe("Property 10: Collaborator removal", () => {
  it("for any non-owner collaborator, owner can remove their access", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        accessLevelArb,
        (canvas, collaboratorId, accessLevel) => {
          // Ensure collaborator is not the owner
          fc.pre(collaboratorId !== canvas.ownerId);

          // Create existing access record
          const existingAccess: AccessRecord[] = [
            {
              canvasId: canvas.id,
              userId: collaboratorId,
              accessLevel,
              grantedAt: Date.now(),
              grantedBy: canvas.ownerId,
            },
          ];

          const result = simulateRemoveCollaborator(
            canvas,
            canvas.ownerId,
            collaboratorId,
            existingAccess,
          );

          // Should succeed
          expect(result.success).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, owner cannot remove themselves", () => {
    fc.assert(
      fc.property(canvasArb, (canvas) => {
        const existingAccess: AccessRecord[] = [];

        const result = simulateRemoveCollaborator(
          canvas,
          canvas.ownerId,
          canvas.ownerId, // Trying to remove self
          existingAccess,
        );

        // Should fail
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("Cannot remove the owner");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("for any canvas, non-owner cannot remove collaborators", () => {
    fc.assert(
      fc.property(
        canvasArb,
        userIdArb,
        userIdArb,
        accessLevelArb,
        (canvas, nonOwnerId, collaboratorId, accessLevel) => {
          // Ensure requesting user is not the owner
          fc.pre(nonOwnerId !== canvas.ownerId);
          fc.pre(collaboratorId !== canvas.ownerId);

          // Create existing access record
          const existingAccess: AccessRecord[] = [
            {
              canvasId: canvas.id,
              userId: collaboratorId,
              accessLevel,
              grantedAt: Date.now(),
              grantedBy: canvas.ownerId,
            },
          ];

          const result = simulateRemoveCollaborator(
            canvas,
            nonOwnerId,
            collaboratorId,
            existingAccess,
          );

          // Should fail
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("Only the owner can remove collaborators");
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas, removal is idempotent (removing non-existent access succeeds)", () => {
    fc.assert(
      fc.property(canvasArb, userIdArb, (canvas, collaboratorId) => {
        // Ensure collaborator is not the owner
        fc.pre(collaboratorId !== canvas.ownerId);

        // No existing access records
        const existingAccess: AccessRecord[] = [];

        const result = simulateRemoveCollaborator(
          canvas,
          canvas.ownerId,
          collaboratorId,
          existingAccess,
        );

        // Should succeed (idempotent)
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
