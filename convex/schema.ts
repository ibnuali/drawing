import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  canvases: defineTable({
    title: v.string(),
    ownerId: v.string(),
    data: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    collaborationEnabled: v.optional(v.boolean()),
    linkAccessEnabled: v.optional(v.boolean()),
    linkAccessLevel: v.optional(v.union(v.literal("editor"), v.literal("viewer"))),
    updatedAt: v.number(),
    categoryId: v.optional(v.id("categories")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["categoryId"]),

  categories: defineTable({
    name: v.string(),
    ownerId: v.string(),
    order: v.number(),
    isCollapsed: v.optional(v.boolean()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_order", ["ownerId", "order"])
    .index("by_owner_name", ["ownerId", "name"]),

  access: defineTable({
    canvasId: v.id("canvases"),
    userId: v.string(),
    accessLevel: v.union(v.literal("editor"), v.literal("viewer")),
    grantedAt: v.number(),
    grantedBy: v.string(),
  })
    .index("by_canvas", ["canvasId"])
    .index("by_canvas_user", ["canvasId", "userId"])
    .index("by_user", ["userId"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

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
