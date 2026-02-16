import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  validateCategoryName,
  isDuplicateName,
  getNextOrder,
  reorderCategories,
} from "../lib/category-logic";

/**
 * List all categories for a given owner, ordered by display order ascending.
 *
 * Requirements: 5.1, 6.2
 */
export const list = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("categories")
      .withIndex("by_owner_order", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

/**
 * Create a new category for the authenticated user.
 * Validates name (non-empty, no duplicates), assigns next order value.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ownerId = identity.subject;

    const validation = validateCategoryName(args.name);
    if (!validation.valid) {
      throw new Error(validation.error ?? "Invalid category name");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    const existingNames = existing.map((c) => c.name);
    if (isDuplicateName(args.name, existingNames)) {
      throw new Error("A category with this name already exists");
    }

    const existingOrders = existing.map((c) => c.order);
    const order = getNextOrder(existingOrders);

    return ctx.db.insert("categories", {
      name: args.name.trim(),
      ownerId,
      order,
    });
  },
});

/**
 * Rename an existing category.
 * Validates new name (non-empty, no duplicates among siblings).
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export const rename = mutation({
  args: { id: v.id("categories"), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");
    if (category.ownerId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const validation = validateCategoryName(args.name);
    if (!validation.valid) {
      throw new Error(validation.error ?? "Invalid category name");
    }

    const siblings = await ctx.db
      .query("categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", category.ownerId))
      .collect();

    const otherNames = siblings
      .filter((c) => c._id !== args.id)
      .map((c) => c.name);

    if (isDuplicateName(args.name, otherNames)) {
      throw new Error("A category with this name already exists");
    }

    await ctx.db.patch(args.id, { name: args.name.trim() });
  },
});

/**
 * Delete a category and move all its canvases to Uncategorized.
 *
 * Requirements: 3.1, 3.2
 */
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");
    if (category.ownerId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Move all canvases in this category to uncategorized
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const canvas of canvases) {
      await ctx.db.patch(canvas._id, { categoryId: undefined });
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder a category to a new position.
 * Updates order fields for all affected categories.
 *
 * Requirements: 6.1
 */
export const reorder = mutation({
  args: { id: v.id("categories"), newPosition: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");
    if (category.ownerId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const all = await ctx.db
      .query("categories")
      .withIndex("by_owner", (q) => q.eq("ownerId", category.ownerId))
      .collect();

    const mapped = all.map((c) => ({ id: c._id, order: c.order }));
    const reordered = reorderCategories(mapped, args.id, args.newPosition);

    for (const item of reordered) {
      const existing = all.find((c) => c._id === item.id);
      if (existing && existing.order !== item.order) {
        await ctx.db.patch(item.id as typeof existing._id, { order: item.order });
      }
    }
  },
});

/**
 * Toggle the collapsed/expanded state of a category.
 *
 * Requirements: 5.3
 */
export const toggleCollapse = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");
    if (category.ownerId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { isCollapsed: !category.isCollapsed });
  },
});
