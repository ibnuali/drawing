/**
 * Pure logic functions for workspace category operations.
 * No Convex dependencies — designed for easy unit/property testing.
 */

export function validateCategoryName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Category name cannot be empty" };
  }
  return { valid: true };
}

export function isDuplicateName(
  name: string,
  existingNames: string[],
): boolean {
  const normalized = name.trim().toLowerCase();
  return existingNames.some((n) => n.trim().toLowerCase() === normalized);
}

export function getNextOrder(existingOrders: number[]): number {
  if (existingOrders.length === 0) return 0;
  return Math.max(...existingOrders) + 1;
}

export function reorderCategories(
  categories: { id: string; order: number }[],
  movedId: string,
  newPosition: number,
): { id: string; order: number }[] {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const movedIndex = sorted.findIndex((c) => c.id === movedId);
  if (movedIndex === -1) return categories;

  const clamped = Math.max(0, Math.min(newPosition, sorted.length - 1));
  const [moved] = sorted.splice(movedIndex, 1);
  sorted.splice(clamped, 0, moved);

  return sorted.map((c, i) => ({ id: c.id, order: i }));
}

export function filterCanvasesBySearch<
  T extends { title: string; categoryId?: string },
>(canvases: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return canvases;
  return canvases.filter((c) => c.title.toLowerCase().includes(q));
}
