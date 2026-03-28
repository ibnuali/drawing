import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { components, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { ownerId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_owner_deleted", (q) =>
        q.eq("ownerId", args.ownerId).eq("deletedAt", undefined)
      )
      .order("desc")
      .collect();

    if (!args.search) return canvases;

    const q = args.search.toLowerCase();
    return canvases.filter((c) => c.title.toLowerCase().includes(q));
  },
});

export const listPaginated = query({
  args: {
    ownerId: v.string(),
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      return await ctx.db
        .query("canvases")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("canvases")
      .withIndex("by_owner_deleted", (q) =>
        q.eq("ownerId", args.ownerId).eq("deletedAt", undefined)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    ownerId: v.string(),
    categoryId: v.optional(v.id("categories")),
    data: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("canvases", {
      title: args.title,
      ownerId: args.ownerId,
      categoryId: args.categoryId,
      data: args.data,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("canvases"), data: v.string() },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");

    // Server-side redundant write guard: skip patch if data is identical
    if (args.data === canvas.data) {
      return;
    }

    await ctx.db.patch(args.id, {
      data: args.data,
      updatedAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: { id: v.id("canvases"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
  },
});

export const restore = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");
    await ctx.db.patch(args.id, { deletedAt: undefined });
  },
});

export const permanentDelete = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");

    const accessRecords = await ctx.db
      .query("access")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.id))
      .collect();

    for (const record of accessRecords) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listTrash = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_owner_deleted", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();

    return canvases.filter((c) => c.deletedAt !== undefined);
  },
});

export const togglePublic = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");
    const isPublic = !canvas.isPublic;
    await ctx.db.patch(args.id, { isPublic });
    return isPublic;
  },
});

export const getPublic = query({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas || !canvas.isPublic) return null;
    return canvas;
  },
});

export const getForCollaboration = query({
  args: { id: v.id("canvases"), userId: v.string() },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) return null;

    // Owner always has full editor access
    if (canvas.ownerId === args.userId) {
      return { ...canvas, userAccessLevel: "owner" as const };
    }

    // Check explicit access record
    const explicitAccess = await ctx.db
      .query("access")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.id).eq("userId", args.userId)
      )
      .unique();

    if (explicitAccess) {
      return { ...canvas, userAccessLevel: explicitAccess.accessLevel };
    }

    // Check link access settings
    if (canvas.linkAccessEnabled) {
      return { ...canvas, userAccessLevel: canvas.linkAccessLevel ?? ("viewer" as const) };
    }

    // Legacy: collaborationEnabled still grants editor access
    if (canvas.collaborationEnabled) {
      return { ...canvas, userAccessLevel: "editor" as const };
    }

    return null;
  },
});

export const updateElements = mutation({
  args: {
    id: v.id("canvases"),
    data: v.string(),
    userId: v.string(),
    expectedVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");

    if (canvas.ownerId !== args.userId) {
      // Check explicit access record
      const explicitAccess = await ctx.db
        .query("access")
        .withIndex("by_canvas_user", (q) =>
          q.eq("canvasId", args.id).eq("userId", args.userId)
        )
        .unique();

      const hasEditAccess =
        explicitAccess?.accessLevel === "editor" ||
        canvas.collaborationEnabled ||
        (canvas.linkAccessEnabled && canvas.linkAccessLevel === "editor");

      if (!hasEditAccess) {
        throw new Error("Not authorized");
      }
    }

    // Server-side redundant write guard: skip patch if data is identical
    if (args.data === canvas.data) {
      return { success: true, currentVersion: canvas.updatedAt };
    }

    // Optimistic concurrency control: if expectedVersion is provided and doesn't match,
    // skip the update (client will reconcile on next sync)
    if (args.expectedVersion !== undefined && canvas.updatedAt !== args.expectedVersion) {
      return { success: false, currentVersion: canvas.updatedAt };
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      data: args.data,
      updatedAt: now,
    });

    return { success: true, currentVersion: now };
  },
});

/**
 * Update link-based access settings for a canvas.
 * Only the canvas owner can update link settings.
 * 
 * Requirements: 6.3, 6.4
 */
export const updateLinkSettings = mutation({
  args: {
    canvasId: v.id("canvases"),
    linkAccessEnabled: v.optional(v.boolean()),
    linkAccessLevel: v.optional(
      v.union(v.literal("editor"), v.literal("viewer"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    
    if (canvas.ownerId !== identity.subject) {
      throw new Error("Only the owner can update link settings");
    }

    const updates: Partial<{
      linkAccessEnabled: boolean;
      linkAccessLevel: "editor" | "viewer";
      isPublic: boolean;
    }> = {};
    
    if (args.linkAccessEnabled !== undefined) {
      updates.linkAccessEnabled = args.linkAccessEnabled;
      updates.isPublic = args.linkAccessEnabled;
    }
    if (args.linkAccessLevel !== undefined) {
      updates.linkAccessLevel = args.linkAccessLevel;
    }

    await ctx.db.patch(args.canvasId, updates);
  },
});


/**
 * List canvases shared with the given user.
 * Queries the access table by userId, fetches each canvas,
 * filters out deleted canvases and canvases owned by the user,
 * looks up owner names, sorts by updatedAt descending, and
 * optionally filters by title search.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export const listShared = query({
  args: { userId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const accessRecords = await ctx.db
      .query("access")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const lookupUser = async (userId: string) => {
      const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: userId }],
      });
      return user as { _id: string; name: string; email: string; image?: string | null } | null;
    };

    const results: Array<{
      _id: (typeof accessRecords)[0]["canvasId"];
      title: string;
      updatedAt: number;
      isPublic?: boolean;
      collaborationEnabled?: boolean;
      accessLevel: "editor" | "viewer";
      ownerName: string;
      ownerId: string;
    }> = [];

    for (const record of accessRecords) {
      const canvas = await ctx.db.get(record.canvasId);
      if (!canvas) continue;
      if (canvas.ownerId === args.userId) continue;
      if (canvas.deletedAt !== undefined) continue;

      const owner = await lookupUser(canvas.ownerId);
      const ownerName = owner?.name ?? "Unknown";

      results.push({
        _id: canvas._id,
        title: canvas.title,
        updatedAt: canvas.updatedAt,
        isPublic: canvas.isPublic,
        collaborationEnabled: canvas.collaborationEnabled,
        accessLevel: record.accessLevel,
        ownerName,
        ownerId: canvas.ownerId,
      });
    }

    results.sort((a, b) => b.updatedAt - a.updatedAt);

    if (!args.search) return results;

    const q = args.search.toLowerCase();
    return results.filter((r) => r.title.toLowerCase().includes(q));
  },
});

/**
 * Assign a canvas to a category, or remove its category (set to uncategorized).
 * Validates canvas ownership and category existence.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const assignCategory = mutation({
  args: {
    canvasId: v.id("canvases"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    if (canvas.ownerId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) throw new Error("Category not found");
      if (category.ownerId !== identity.subject) {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.patch(args.canvasId, {
      categoryId: args.categoryId ?? undefined,
    });
  },
});

export const listByCategoryName = query({
  args: { ownerId: v.string(), categoryName: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_owner_name", (q) =>
        q.eq("ownerId", args.ownerId).eq("name", args.categoryName)
      )
      .unique();

    if (!category) return [];

    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .order("desc")
      .collect();

    const activeCanvases = canvases.filter((c) => c.deletedAt === undefined);

    if (!args.search) return activeCanvases;

    const q = args.search.toLowerCase();
    return activeCanvases.filter((c) => c.title.toLowerCase().includes(q));
  },
});

export const saveThumbnail = mutation({
  args: {
    id: v.id("canvases"),
    thumbnailId: v.optional(v.id("_storage")),
    thumbnailIdDark: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");

    // Delete old thumbnails if being replaced
    if (args.thumbnailId !== undefined && canvas.thumbnailId && args.thumbnailId !== canvas.thumbnailId) {
      await ctx.storage.delete(canvas.thumbnailId);
    }
    if (args.thumbnailIdDark !== undefined && canvas.thumbnailIdDark && args.thumbnailIdDark !== canvas.thumbnailIdDark) {
      await ctx.storage.delete(canvas.thumbnailIdDark);
    }

    const updates: { thumbnailId?: Id<"_storage">; thumbnailIdDark?: Id<"_storage"> } = {};
    if (args.thumbnailId !== undefined) updates.thumbnailId = args.thumbnailId;
    if (args.thumbnailIdDark !== undefined) updates.thumbnailIdDark = args.thumbnailIdDark;

    await ctx.db.patch(args.id, updates);
  },
});

export const getThumbnailUrl = query({
  args: { thumbnailId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.thumbnailId);
  },
});

export const getCanvasThumbnailUrl = query({
  args: { canvasId: v.id("canvases"), theme: v.optional(v.union(v.literal("light"), v.literal("dark"))) },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) return null;

    const theme = args.theme ?? "light";
    const thumbnailId = theme === "dark" ? canvas.thumbnailIdDark : canvas.thumbnailId;

    if (!thumbnailId) {
      // Fall back to the other theme's thumbnail if this one doesn't exist
      const fallbackId = theme === "dark" ? canvas.thumbnailId : canvas.thumbnailIdDark;
      if (!fallbackId) return null;
      return await ctx.storage.getUrl(fallbackId);
    }

    return await ctx.storage.getUrl(thumbnailId);
  },
});

export const uploadThumbnails = action({
  args: {
    canvasId: v.id("canvases"),
    lightDataUrl: v.optional(v.string()), // base64 data URL for light theme
    darkDataUrl: v.optional(v.string()),  // base64 data URL for dark theme
  },
  handler: async (ctx, args) => {
    const storeImage = async (dataUrl: string): Promise<Id<"_storage">> => {
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];

      const blob = new Blob(
        [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
        { type: mimeType }
      );

      return (await ctx.storage.store(blob as any)) as Id<"_storage">;
    };

    const lightId = args.lightDataUrl ? await storeImage(args.lightDataUrl) : undefined;
    const darkId = args.darkDataUrl ? await storeImage(args.darkDataUrl) : undefined;

    // Update canvas with new thumbnail IDs
    await ctx.runMutation(api.canvases.saveThumbnail, {
      id: args.canvasId,
      thumbnailId: lightId,
      thumbnailIdDark: darkId,
    });

    return { lightId, darkId };
  },
});
