/**
 * Property-based tests for collaboration utilities.
 * Feature: real-time-collaboration
 *
 * Uses fast-check to validate correctness properties from the design document.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ExcalidrawElement } from "@excalidraw/excalidraw";
import {
  getUserColor,
  COLLABORATOR_COLORS,
  reconcileElements,
  serializeElements,
  deserializeElements,
} from "../collaboration";

// --- Generators ---

/**
 * Generates a minimal ExcalidrawElement with the fields relevant to
 * reconciliation and serialization. Uses the [key: string]: any escape
 * hatch in the type to keep generators focused.
 */
/**
 * Generates a JSON-safe double (no -0, since JSON.stringify(-0) === "0").
 * This avoids false negatives in round-trip tests caused by JSON's inability
 * to represent negative zero.
 */
const jsonSafeDouble = (opts: { min: number; max: number }) =>
  fc
    .double({ ...opts, noNaN: true, noDefaultInfinity: true })
    .map((v) => (Object.is(v, -0) ? 0 : v));

const excalidrawElementArb = (
  idArb: fc.Arbitrary<string> = fc.uuid(),
): fc.Arbitrary<ExcalidrawElement> =>
  fc.record({
    id: idArb,
    type: fc.constantFrom("rectangle", "ellipse", "line", "text", "freedraw"),
    x: jsonSafeDouble({ min: -1e4, max: 1e4 }),
    y: jsonSafeDouble({ min: -1e4, max: 1e4 }),
    width: jsonSafeDouble({ min: 0, max: 1e4 }),
    height: jsonSafeDouble({ min: 0, max: 1e4 }),
    angle: fc.constant(0),
    strokeColor: fc.constant("#000000"),
    backgroundColor: fc.constant("transparent"),
    fillStyle: fc.constant("hachure"),
    strokeWidth: fc.constant(1),
    strokeStyle: fc.constant("solid"),
    roughness: fc.constant(1),
    opacity: fc.integer({ min: 0, max: 100 }),
    groupIds: fc.constant([] as string[]),
    frameId: fc.constant(null),
    roundness: fc.constant(null),
    seed: fc.integer({ min: 0, max: 2 ** 31 - 1 }),
    version: fc.integer({ min: 1, max: 1000 }),
    versionNonce: fc.integer({ min: 0, max: 2 ** 31 - 1 }),
    isDeleted: fc.constant(false),
    boundElements: fc.constant(null),
    updated: fc.integer({ min: 0, max: Date.now() + 1_000_000 }),
    link: fc.constant(null),
    locked: fc.constant(false),
  }) as fc.Arbitrary<ExcalidrawElement>;

// --- Property 10: User color determinism ---
// Feature: real-time-collaboration, Property 10: User color determinism
// Validates: Requirements 2.1
describe("Property 10: User color determinism", () => {
  it("for any userId string, getUserColor always returns the same color from the palette", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 100 }), (userId) => {
        const color1 = getUserColor(userId);
        const color2 = getUserColor(userId);

        // Same input always produces same output
        expect(color1).toBe(color2);

        // Result is always one of the predefined palette values
        expect(COLLABORATOR_COLORS).toContain(color1);
      }),
      { numRuns: 100 },
    );
  });
});

// --- Property 4: Non-overlapping element merge preserves all elements ---
// Feature: real-time-collaboration, Property 4: Non-overlapping element merge preserves all elements
// Validates: Requirements 3.2, 3.5
describe("Property 4: Non-overlapping element merge preserves all elements", () => {
  it("for any two sets of elements with disjoint IDs, reconciliation contains every element from both sets", () => {
    fc.assert(
      fc.property(
        fc.array(excalidrawElementArb(fc.uuid()), {
          minLength: 0,
          maxLength: 15,
        }),
        fc.array(excalidrawElementArb(fc.uuid()), {
          minLength: 0,
          maxLength: 15,
        }),
        (localElements, remoteElements) => {
          // Ensure IDs are disjoint by prefixing
          const local = localElements.map((el, i) => ({
            ...el,
            id: `local-${i}-${el.id}`,
          })) as ExcalidrawElement[];
          const remote = remoteElements.map((el, i) => ({
            ...el,
            id: `remote-${i}-${el.id}`,
          })) as ExcalidrawElement[];

          const merged = reconcileElements(local, remote);

          // Merged set should contain all elements from both sets
          expect(merged.length).toBe(local.length + remote.length);

          const mergedIds = new Set(merged.map((el) => el.id));
          for (const el of local) {
            expect(mergedIds.has(el.id)).toBe(true);
          }
          for (const el of remote) {
            expect(mergedIds.has(el.id)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 5: Same-element reconciliation uses higher version ---
// Feature: real-time-collaboration, Property 5: Same-element reconciliation uses higher version
// Validates: Requirements 3.3
describe("Property 5: Same-element reconciliation uses higher version", () => {
  it("for any two versions of the same element, reconciliation keeps the one with higher version (ties go to remote)", () => {
    fc.assert(
      fc.property(
        excalidrawElementArb(),
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 500 }),
        (baseElement, localVersion, remoteVersion) => {
          const localEl = {
            ...baseElement,
            version: localVersion,
          } as ExcalidrawElement;
          const remoteEl = {
            ...baseElement,
            version: remoteVersion,
          } as ExcalidrawElement;

          const merged = reconcileElements([localEl], [remoteEl]);

          // Should produce exactly one element (same ID)
          expect(merged.length).toBe(1);

          if (remoteVersion >= localVersion) {
            // Remote wins on higher or equal version
            expect(merged[0].version).toBe(remoteVersion);
          } else {
            // Local wins on strictly higher version
            expect(merged[0].version).toBe(localVersion);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// --- Property 6: Element sync round-trip ---
// Feature: real-time-collaboration, Property 6: Element sync round-trip
// Validates: Requirements 3.4
describe("Property 6: Element sync round-trip", () => {
  it("for any valid set of elements, serializing then deserializing produces an equivalent set", () => {
    fc.assert(
      fc.property(
        fc.array(excalidrawElementArb(), { minLength: 0, maxLength: 20 }),
        (elements) => {
          const serialized = serializeElements(elements);
          const deserialized = deserializeElements(serialized);

          expect(deserialized.length).toBe(elements.length);

          for (let i = 0; i < elements.length; i++) {
            expect(deserialized[i].id).toBe(elements[i].id);
            expect(deserialized[i].version).toBe(elements[i].version);
            expect(deserialized[i].type).toBe(elements[i].type);
            expect(deserialized[i].x).toBe(elements[i].x);
            expect(deserialized[i].y).toBe(elements[i].y);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
