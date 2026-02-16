import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DatabaseWriter } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { components } from "./_generated/api";

/**
 * Recalculate and update the canvas `collaborationEnabled` flag.
 * Enabled when at least one non-owner collaborator has "editor" access.
 */
async function syncCollaborationFlag(
  db: DatabaseWriter,
  canvasId: Id<"canvases">
) {
  const accessRecords = await db
    .query("access")
    .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
    .collect();

  const hasEditor = accessRecords.some((r) => r.accessLevel === "editor");

  const canvas = await db.get(canvasId);
  if (canvas && canvas.collaborationEnabled !== hasEditor) {
    await db.patch(canvasId, { collaborationEnabled: hasEditor });

    // If collaboration was just disabled, clean up non-owner presence
    if (!hasEditor) {
      const presenceRecords = await db
        .query("presence")
        .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
        .collect();
      for (const record of presenceRecords) {
        if (record.userId !== canvas.ownerId) {
          await db.delete(record._id);
        }
      }
    }
  }
}

/**
 * Add a collaborator to a canvas with specified access level.
 * Only the canvas owner can add collaborators.
 * 
 * Requirements: 2.3, 9.2
 */
export const addCollaborator = mutation({
  args: {
    canvasId: v.id("canvases"),
    userId: v.string(),
    accessLevel: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    
    if (canvas.ownerId !== identity.subject) {
      throw new Error("Only the owner can add collaborators");
    }

    // Prevent adding the owner as a collaborator
    if (args.userId === canvas.ownerId) {
      throw new Error("The owner already has full access");
    }

    // Check if access already exists
    const existing = await ctx.db
      .query("access")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      throw new Error("User already has access");
    }

    await ctx.db.insert("access", {
      canvasId: args.canvasId,
      userId: args.userId,
      accessLevel: args.accessLevel,
      grantedAt: Date.now(),
      grantedBy: identity.subject,
    });

    // Sync collaboration flag based on whether any editor exists
    await syncCollaborationFlag(ctx.db, args.canvasId);
  },
});

/**
 * Remove a collaborator's access to a canvas.
 * Only the canvas owner can remove collaborators.
 * The owner cannot be removed.
 * 
 * Requirements: 4.4
 */
export const removeCollaborator = mutation({
  args: {
    canvasId: v.id("canvases"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    
    if (canvas.ownerId !== identity.subject) {
      throw new Error("Only the owner can remove collaborators");
    }
    
    if (args.userId === canvas.ownerId) {
      throw new Error("Cannot remove the owner");
    }

    const access = await ctx.db
      .query("access")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("userId", args.userId)
      )
      .unique();

    if (access) {
      await ctx.db.delete(access._id);
    }

    // Sync collaboration flag — may disable if no editors remain
    await syncCollaborationFlag(ctx.db, args.canvasId);
  },
});

/**
 * Update a collaborator's access level.
 * Only the canvas owner can update access levels.
 * 
 * Requirements: 4.2, 4.3, 4.6
 */
export const updateAccessLevel = mutation({
  args: {
    canvasId: v.id("canvases"),
    userId: v.string(),
    accessLevel: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    
    if (canvas.ownerId !== identity.subject) {
      throw new Error("Only the owner can update access levels");
    }

    const access = await ctx.db
      .query("access")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("userId", args.userId)
      )
      .unique();

    if (!access) {
      throw new Error("Access record not found");
    }

    await ctx.db.patch(access._id, {
      accessLevel: args.accessLevel,
    });

    // Sync collaboration flag — editor→viewer may disable, viewer→editor may enable
    await syncCollaborationFlag(ctx.db, args.canvasId);
  },
});

/**
 * Get all collaborators for a canvas, including the owner.
 * Returns formatted collaborator list with user details.
 * Owner appears first in the list.
 * 
 * Requirements: 3.2, 3.3
 */
export const getCollaborators = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) return [];

    // Fetch all access records for this canvas
    const accessRecords = await ctx.db
      .query("access")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Helper to look up a user from the BetterAuth component by ID
    const lookupUser = async (userId: string) => {
      const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: userId }],
      });
      return user as { _id: string; name: string; email: string; image?: string | null } | null;
    };

    // Get owner user details
    const owner = await lookupUser(canvas.ownerId);

    // Get collaborator user details (exclude owner — added separately)
    const collaborators = await Promise.all(
      accessRecords
        .filter((access) => access.userId !== canvas.ownerId)
        .map(async (access) => {
        const user = await lookupUser(access.userId);
        return user
          ? {
              userId: access.userId,
              userName: user.name,
              userEmail: user.email,
              accessLevel: access.accessLevel,
              avatarUrl: user.image ?? undefined,
            }
          : null;
      })
    );

    const result: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      accessLevel: "owner" | "editor" | "viewer";
      avatarUrl?: string;
    }> = collaborators.filter((c): c is NonNullable<typeof c> => c !== null);

    // Add owner as first entry
    if (owner) {
      result.unshift({
        userId: canvas.ownerId,
        userName: owner.name,
        userEmail: owner.email,
        accessLevel: "owner",
        avatarUrl: owner.image ?? undefined,
      });
    }

    return result;
  },
});
