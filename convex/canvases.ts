import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
