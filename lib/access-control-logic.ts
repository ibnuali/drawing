/**
 * Pure access control logic extracted for testability.
 * These functions mirror the authorization checks in convex/canvases.ts
 * but operate on plain data rather than Convex database contexts.
 */

export interface CanvasRecord {
  ownerId: string;
  collaborationEnabled?: boolean;
  linkAccessEnabled?: boolean;
  linkAccessLevel?: "editor" | "viewer";
}

export interface AccessRecord {
  userId: string;
  accessLevel: "editor" | "viewer";
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


/**
 * Determines the effective access level for a user on a canvas,
 * considering owner status, explicit access records, and link access settings.
 *
 * Priority:
 * 1. Owner always gets full access ("owner")
 * 2. Explicit access record takes precedence over link access
 * 3. Link access applies if enabled and no explicit record exists
 * 4. Returns null if no access is granted
 *
 * Requirements: 6.3
 */
export function resolveAccessLevel(
  canvas: CanvasRecord | null,
  userId: string,
  explicitAccess: AccessRecord | null,
): "owner" | "editor" | "viewer" | null {
  if (!canvas) return null;

  // Owner always has access
  if (canvas.ownerId === userId) return "owner";

  // Explicit access takes precedence
  if (explicitAccess) return explicitAccess.accessLevel;

  // Link access if enabled
  if (canvas.linkAccessEnabled && canvas.linkAccessLevel) {
    return canvas.linkAccessLevel;
  }

  return null;
}

/**
 * Determines whether a user can access a canvas at all.
 * Returns true if the user has any level of access (owner, explicit, or link).
 *
 * Requirements: 6.3
 */
export function canAccessCanvas(
  canvas: CanvasRecord | null,
  userId: string,
  explicitAccess: AccessRecord | null,
): boolean {
  return resolveAccessLevel(canvas, userId, explicitAccess) !== null;
}
