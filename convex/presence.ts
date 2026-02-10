import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const STALE_THRESHOLD_MS = 30_000;

export const update = mutation({
  args: {
    canvasId: v.id("canvases"),
    userId: v.string(),
    userName: v.string(),
    userColor: v.string(),
    pointer: v.optional(v.object({ x: v.number(), y: v.number() })),
    selectedElementIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("userId", args.userId),
      )
      .unique();

    const data = {
      canvasId: args.canvasId,
      userId: args.userId,
      userName: args.userName,
      userColor: args.userColor,
      pointer: args.pointer,
      selectedElementIds: args.selectedElementIds ?? [],
      lastSeen: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("presence", data);
    }
  },
});

export const remove = mutation({
  args: {
    canvasId: v.id("canvases"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("userId", args.userId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getByCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("presence")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    const now = Date.now();
    return records.map((r) => ({
      ...r,
      isIdle: now - r.lastSeen > STALE_THRESHOLD_MS,
    }));
  },
});

export const getActiveCollaborators = query({
  args: { canvasIds: v.array(v.id("canvases")) },
  handler: async (ctx, args) => {
    const result: Record<string, { count: number; names: string[] }> = {};
    const now = Date.now();

    for (const canvasId of args.canvasIds) {
      const records = await ctx.db
        .query("presence")
        .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
        .collect();

      const active = records.filter(
        (r) => now - r.lastSeen <= STALE_THRESHOLD_MS,
      );
      if (active.length > 0) {
        result[canvasId] = {
          count: active.length,
          names: active.map((r) => r.userName),
        };
      }
    }

    return result;
  },
});

const PURGE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const purgeStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - PURGE_THRESHOLD_MS;
    const staleRecords = await ctx.db
      .query("presence")
      .filter((q) => q.lt(q.field("lastSeen"), cutoff))
      .collect();

    for (const record of staleRecords) {
      await ctx.db.delete(record._id);
    }

    return { deleted: staleRecords.length };
  },
});
