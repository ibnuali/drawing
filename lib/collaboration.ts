/**
 * Collaboration utilities: deterministic user color assignment and
 * element reconciliation helpers.
 *
 * Pure functions extracted for testability — these mirror logic used by
 * the useCollaboration hook but can be tested without Excalidraw or Convex.
 */

import type { ExcalidrawElement } from "@excalidraw/excalidraw";

// 12-color palette for collaborator cursors / selections
export const COLLABORATOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F0B27A",
  "#82E0AA",
] as const;

/**
 * Returns a deterministic color for a given userId by hashing the string
 * into the 12-color palette. The same userId always maps to the same color.
 */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length];
}

/**
 * Reconciles two sets of Excalidraw elements by ID.
 *
 * For elements that exist only in one set, they pass through unchanged.
 * For elements that exist in both sets (same `id`), the one with the
 * higher `version` wins (last-write-wins). On equal version the remote
 * element is preferred to avoid local staleness.
 *
 * This is a pure, testable wrapper around the reconciliation strategy
 * described in the design doc. The actual Excalidraw `reconcileElements`
 * import is used at the hook level where AppState is available; this
 * function covers the core merge logic for property testing.
 */
export function reconcileElements(
  localElements: readonly ExcalidrawElement[],
  remoteElements: readonly ExcalidrawElement[],
): ExcalidrawElement[] {
  const merged = new Map<string, ExcalidrawElement>();

  // Seed with local elements
  for (const el of localElements) {
    merged.set(el.id, el);
  }

  // Overlay remote elements — higher version wins, ties go to remote
  for (const remote of remoteElements) {
    const local = merged.get(remote.id);
    if (!local || remote.version >= local.version) {
      merged.set(remote.id, remote);
    }
  }

  return Array.from(merged.values());
}

/**
 * Serializes Excalidraw elements to a JSON string suitable for storage
 * in the `canvases.data` field.
 */
export function serializeElements(
  elements: readonly ExcalidrawElement[],
): string {
  return JSON.stringify(elements);
}

/**
 * Deserializes a JSON string from `canvases.data` back into an array
 * of Excalidraw elements.
 */
export function deserializeElements(data: string): ExcalidrawElement[] {
  return JSON.parse(data) as ExcalidrawElement[];
}
