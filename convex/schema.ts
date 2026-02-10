import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  canvases: defineTable({
    title: v.string(),
    ownerId: v.string(),
    data: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),
});
