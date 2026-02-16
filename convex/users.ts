import { v } from "convex/values";
import { query } from "./_generated/server";
import { components } from "./_generated/api";

/**
 * Look up a user by email address (case-insensitive).
 * Returns user ID, name, and email if found, null otherwise.
 * Queries the BetterAuth component's user table.
 *
 * Requirements: 9.1
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [
        { field: "email", operator: "eq", value: args.email.toLowerCase() },
      ],
    });

    if (!user) return null;

    return {
      id: user._id as string,
      name: (user.name as string) ?? "",
      email: user.email as string,
    };
  },
});
