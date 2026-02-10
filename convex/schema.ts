import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  canvases: defineTable({
    title: v.string(),
    ownerId: v.string(),
    data: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    collaborationEnabled: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  presence: defineTable({
    canvasId: v.id("canvases"),
    userId: v.string(),
    userName: v.string(),
    userColor: v.string(),
    pointer: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
      }),
    ),
    selectedElementIds: v.array(v.string()),
    lastSeen: v.number(),
  })
    .index("by_canvas", ["canvasId"])
    .index("by_canvas_user", ["canvasId", "userId"]),
});
