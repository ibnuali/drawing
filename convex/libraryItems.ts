import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * List all library items (shared across all users).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("libraryItems").order("desc").collect();
    return items;
  },
});

/**
 * Get a single library item by ID.
 */
export const get = query({
  args: { id: v.id("libraryItems") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

/**
 * Create a new library item.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    elements: v.string(),
    createdById: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("libraryItems", {
      name: args.name,
      description: args.description,
      elements: args.elements,
      createdById: args.createdById,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update a library item.
 */
export const update = mutation({
  args: {
    id: v.id("libraryItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    elements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Library item not found");

    await ctx.db.patch(id, {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.elements !== undefined && { elements: updates.elements }),
    });
  },
});

/**
 * Delete a library item.
 */
export const remove = mutation({
  args: { id: v.id("libraryItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Library item not found");

    // Delete thumbnail if exists
    if (item.thumbnailId) {
      await ctx.storage.delete(item.thumbnailId);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Save thumbnail for a library item.
 */
export const saveThumbnail = mutation({
  args: {
    id: v.id("libraryItems"),
    thumbnailId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Library item not found");

    // Delete old thumbnail if exists
    if (item.thumbnailId) {
      await ctx.storage.delete(item.thumbnailId);
    }

    await ctx.db.patch(args.id, { thumbnailId: args.thumbnailId });
  },
});

/**
 * Get thumbnail URL for a library item.
 */
export const getThumbnailUrl = query({
  args: { thumbnailId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.thumbnailId);
  },
});

/**
 * Upload thumbnail from base64 data URL.
 */
export const uploadThumbnail = action({
  args: {
    libraryItemId: v.id("libraryItems"),
    dataUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const base64Data = args.dataUrl.split(",")[1];
    const mimeType = args.dataUrl.split(",")[0].split(":")[1].split(";")[0];

    const blob = new Blob(
      [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
      { type: mimeType }
    );

    const thumbnailId = (await ctx.storage.store(blob as any)) as Id<"_storage">;

    await ctx.runMutation(api.libraryItems.saveThumbnail, {
      id: args.libraryItemId,
      thumbnailId,
    });

    return thumbnailId;
  },
});

import { api } from "./_generated/api";