/**
 * Shared type definitions for the Xdraw application.
 *
 * This file contains type definitions that are used across multiple components
 * to ensure consistency and reduce duplication.
 */

import type { Id } from "@/convex/_generated/dataModel";

/**
 * Category option for use in canvas menus and dropdowns.
 * Represents a selectable category with its ID and name.
 *
 * @example
 * ```tsx
 * const categories: CategoryOption[] = [
 *   { _id: "cat1", name: "Work" },
 *   { _id: "cat2", name: "Personal" },
 * ];
 * ```
 */
export interface CategoryOption {
  _id: string;
  name: string;
}

/**
 * Category option with Convex ID type for database operations.
 * Used when the full Convex ID type is needed instead of a string.
 */
export interface CategoryOptionWithId {
  _id: Id<"categories">;
  name: string;
}