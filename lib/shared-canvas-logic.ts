/**
 * Pure shared canvas filtering and sorting logic.
 * Extracted for testability — these functions operate on plain data
 * and are used by the Convex query and UI components.
 */

export interface SharedAccessRecord {
  canvasId: string;
  userId: string;
  accessLevel: "editor" | "viewer";
}

export interface SharedCanvasEntry {
  canvasId: string;
  title: string;
  updatedAt: number;
  ownerId: string;
  accessLevel: "editor" | "viewer";
}

/**
 * Filters access records to only those where:
 * - The canvas exists in the canvas map (not null/deleted)
 * - The user is NOT the canvas owner
 *
 * Requirements: 1.1, 1.4
 */
export function filterSharedCanvases(
  accessRecords: SharedAccessRecord[],
  canvasMap: Map<string, { title: string; updatedAt: number; ownerId: string }>,
  userId: string,
): SharedCanvasEntry[] {
  return accessRecords
    .filter((record) => {
      const canvas = canvasMap.get(record.canvasId);
      return canvas != null && canvas.ownerId !== userId;
    })
    .map((record) => {
      const canvas = canvasMap.get(record.canvasId)!;
      return {
        canvasId: record.canvasId,
        title: canvas.title,
        updatedAt: canvas.updatedAt,
        ownerId: canvas.ownerId,
        accessLevel: record.accessLevel,
      };
    });
}

/**
 * Sorts shared canvas entries by updatedAt descending (most recent first).
 *
 * Requirements: 1.2
 */
export function sortSharedByUpdatedAt(
  items: SharedCanvasEntry[],
): SharedCanvasEntry[] {
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Filters shared canvas entries by case-insensitive title match.
 *
 * Requirements: 1.3
 */
export function filterByTitle(
  items: SharedCanvasEntry[],
  query: string,
): SharedCanvasEntry[] {
  const q = query.toLowerCase();
  return items.filter((item) => item.title.toLowerCase().includes(q));
}
