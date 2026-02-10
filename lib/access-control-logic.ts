/**
 * Pure access control logic extracted for testability.
 * These functions mirror the authorization checks in convex/canvases.ts
 * but operate on plain data rather than Convex database contexts.
 */

export interface CanvasRecord {
  ownerId: string;
  collaborationEnabled?: boolean;
}

/**
 * Determines whether a user can access a canvas for collaboration.
 * Mirrors the logic in getForCollaboration query.
 *
 * Returns the canvas if:
 * - The user is the owner, OR
 * - collaborationEnabled is true
 *
 * Returns null otherwise.
 */
export function canAccessForCollaboration(
  canvas: CanvasRecord | null,
  userId: string,
): CanvasRecord | null {
  if (!canvas) return null;
  if (canvas.ownerId === userId) return canvas;
  if (canvas.collaborationEnabled) return canvas;
  return null;
}

/**
 * Determines whether a user can perform destructive actions on a canvas
 * (delete, toggle collaboration, toggle sharing settings).
 * Only the owner is authorized.
 */
export function canPerformDestructiveAction(
  canvas: CanvasRecord,
  userId: string,
): boolean {
  return canvas.ownerId === userId;
}
