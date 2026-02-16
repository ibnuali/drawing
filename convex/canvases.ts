import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";

export const list = query({
  args: { ownerId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();

    if (!args.search) return canvases;

    const q = args.search.toLowerCase();
    return canvases.filter((c) => c.title.toLowerCase().includes(q));
  },
});

export const get = query({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { title: v.string(), ownerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.insert("canvases", {
      title: args.title,
      ownerId: args.ownerId,
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
    await ctx.db.delete(args.id);
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
