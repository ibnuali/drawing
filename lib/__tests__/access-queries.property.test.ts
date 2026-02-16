/**
 * Property-based tests for access queries.
 * Feature: canvas-sharing-modal
 *
 * Uses fast-check to validate correctness properties from the design document.
 * 
 * Note: These tests validate the logical properties of query functions.
 * Since Convex queries require database context, we test the business logic
 * that would be enforced by these queries.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// --- Type Definitions ---

type AccessLevel = "owner" | "editor" | "viewer";

interface User {
  clerkId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  accessLevel: AccessLevel;
  avatarUrl?: string;
}

interface AccessRecord {
  canvasId: string;
  userId: string;
  accessLevel: "editor" | "viewer";
}

interface Canvas {
  id: string;
  ownerId: string;
  title: string;
}

// --- Generators ---

const userIdArb = fc.string({ minLength: 1, maxLength: 30 });
const canvasIdArb = fc.string({ minLength: 1, maxLength: 30 });
const emailArb = fc.emailAddress();
const nameArb = fc.string({ minLength: 1, maxLength: 50 });
const accessLevelArb = fc.constantFrom<"editor" | "viewer">("editor", "viewer");

const userArb: fc.Arbitrary<User> = fc.record({
  clerkId: userIdArb,
  name: nameArb,
  email: emailArb,
  avatarUrl: fc.option(fc.webUrl(), { nil: undefined }),
});

const canvasArb: fc.Arbitrary<Canvas> = fc.record({
  id: canvasIdArb,
  ownerId: userIdArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
});

// --- Helper Functions (Business Logic) ---

/**
 * Simulates the logic of getCollaborators query.
 * Returns a list of collaborators with the owner first.
 */
function simulateGetCollaborators(
  canvas: Canvas,
  accessRecords: AccessRecord[],
  users: User[],
): Collaborator[] {
  // Find owner
  const owner = users.find((u) => u.clerkId === canvas.ownerId);
  
  // Map access records to collaborators
  const collaborators: Collaborator[] = [];
  for (const access of accessRecords) {
    if (access.canvasId !== canvas.id) continue;
    const user = users.find((u) => u.clerkId === access.userId);
    if (!user) continue;
    const collab: Collaborator = {
      userId: access.userId,
      userName: user.name,
      userEmail: user.email,
      accessLevel: access.accessLevel,
    };
    if (user.avatarUrl !== undefined) {
      collab.avatarUrl = user.avatarUrl;
    }
    collaborators.push(collab);
  }

  // Add owner as first entry
  if (owner) {
    collaborators.unshift({
      userId: canvas.ownerId,
      userName: owner.name,
      userEmail: owner.email,
      accessLevel: "owner",
      avatarUrl: owner.avatarUrl,
    });
  }

  return collaborators;
}

/**
 * Simulates the logic of getUserByEmail query.
 * Returns user details if found, null otherwise.
 */
function simulateGetUserByEmail(
  email: string,
  users: User[],
): { id: string; name: string; email: string } | null {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  return user
    ? {
        id: user.clerkId,
        name: user.name,
        email: user.email,
      }
    : null;
}

// --- Property 7: Owner first ordering ---
// Feature: canvas-sharing-modal, Property 7: Owner first ordering
// Validates: Requirements 3.3
describe("Property 7: Owner first ordering", () => {
  it("for any collaborator list, the canvas owner should always appear at index 0", () => {
    fc.assert(
      fc.property(
        canvasArb,
        fc.array(userArb, { minLength: 1, maxLength: 10 }),
        fc.array(accessLevelArb, { minLength: 0, maxLength: 9 }),
        (canvas, users, accessLevels) => {
          // Ensure owner is in the users list
          const ownerUser = users[0];
          const modifiedCanvas = { ...canvas, ownerId: ownerUser.clerkId };
          
          // Create access records for other users (not the owner)
          const accessRecords: AccessRecord[] = users
            .slice(1, accessLevels.length + 1)
            .map((user, idx) => ({
              canvasId: modifiedCanvas.id,
              userId: user.clerkId,
              accessLevel: accessLevels[idx] || "editor",
            }));

          const collaborators = simulateGetCollaborators(
            modifiedCanvas,
            accessRecords,
            users,
          );

          // Owner should be at index 0
          expect(collaborators.length).toBeGreaterThan(0);
          expect(collaborators[0].userId).toBe(modifiedCanvas.ownerId);
          expect(collaborators[0].accessLevel).toBe("owner");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any canvas with no collaborators, owner should still be first and only entry", () => {
    fc.assert(
      fc.property(canvasArb, userArb, (canvas, ownerUser) => {
        const modifiedCanvas = { ...canvas, ownerId: ownerUser.clerkId };
        const accessRecords: AccessRecord[] = [];
        const users = [ownerUser];

        const collaborators = simulateGetCollaborators(
          modifiedCanvas,
          accessRecords,
          users,
        );

        // Should have exactly one entry: the owner
        expect(collaborators.length).toBe(1);
        expect(collaborators[0].userId).toBe(modifiedCanvas.ownerId);
        expect(collaborators[0].accessLevel).toBe("owner");
      }),
      { numRuns: 100 },
    );
  });

  it("for any canvas with multiple collaborators, owner is always first regardless of access record order", () => {
    fc.assert(
      fc.property(
        canvasArb,
        fc.array(userArb, { minLength: 3, maxLength: 10 }),
        (canvas, users) => {
          // First user is the owner
          const ownerUser = users[0];
          const modifiedCanvas = { ...canvas, ownerId: ownerUser.clerkId };
          
          // Create access records for all other users
          const accessRecords: AccessRecord[] = users.slice(1).map((user) => ({
            canvasId: modifiedCanvas.id,
            userId: user.clerkId,
            accessLevel: "editor",
          }));

          const collaborators = simulateGetCollaborators(
            modifiedCanvas,
            accessRecords,
            users,
          );

          // Owner should be at index 0
          expect(collaborators[0].userId).toBe(modifiedCanvas.ownerId);
          expect(collaborators[0].accessLevel).toBe("owner");
          
          // All other entries should not be the owner
          for (let i = 1; i < collaborators.length; i++) {
            expect(collaborators[i].userId).not.toBe(modifiedCanvas.ownerId);
            expect(collaborators[i].accessLevel).not.toBe("owner");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 17: User lookup by email ---
// Feature: canvas-sharing-modal, Property 17: User lookup by email
// Validates: Requirements 9.1
describe("Property 17: User lookup by email", () => {
  it("for any email address, getUserByEmail should return user object if email exists", () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (users, targetIndex) => {
          // Ensure we have a valid target index
          fc.pre(targetIndex < users.length);
          
          const targetUser = users[targetIndex];
          const result = simulateGetUserByEmail(targetUser.email, users);

          // Should return the user
          expect(result).not.toBeNull();
          if (result) {
            expect(result.id).toBe(targetUser.clerkId);
            expect(result.name).toBe(targetUser.name);
            expect(result.email).toBe(targetUser.email);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any email address not in the users list, getUserByEmail should return null", () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 20 }),
        emailArb,
        (users, searchEmail) => {
          // Ensure the search email is not in the users list
          fc.pre(!users.some((u) => u.email.toLowerCase() === searchEmail.toLowerCase()));

          const result = simulateGetUserByEmail(searchEmail, users);

          // Should return null
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any email address, lookup should be case-insensitive", () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (users, targetIndex) => {
          // Ensure we have a valid target index
          fc.pre(targetIndex < users.length);
          
          const targetUser = users[targetIndex];
          
          // Test with uppercase version of email
          const upperEmail = targetUser.email.toUpperCase();
          const resultUpper = simulateGetUserByEmail(upperEmail, users);
          
          // Test with lowercase version of email
          const lowerEmail = targetUser.email.toLowerCase();
          const resultLower = simulateGetUserByEmail(lowerEmail, users);
          
          // Test with mixed case
          const mixedEmail = targetUser.email
            .split("")
            .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join("");
          const resultMixed = simulateGetUserByEmail(mixedEmail, users);

          // All should return the same user
          expect(resultUpper).not.toBeNull();
          expect(resultLower).not.toBeNull();
          expect(resultMixed).not.toBeNull();
          
          if (resultUpper && resultLower && resultMixed) {
            expect(resultUpper.id).toBe(targetUser.clerkId);
            expect(resultLower.id).toBe(targetUser.clerkId);
            expect(resultMixed.id).toBe(targetUser.clerkId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any user, returned object should contain only id, name, and email (no avatarUrl)", () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (users, targetIndex) => {
          // Ensure we have a valid target index
          fc.pre(targetIndex < users.length);
          
          const targetUser = users[targetIndex];
          const result = simulateGetUserByEmail(targetUser.email, users);

          // Should return user with only id, name, email
          expect(result).not.toBeNull();
          if (result) {
            expect(Object.keys(result).sort()).toEqual(["email", "id", "name"]);
            expect(result).not.toHaveProperty("avatarUrl");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
