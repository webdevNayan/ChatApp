import { mutation } from "./_generated/server";

/**
 * Migration: Convert reactions from old object format {} to new array format []
 * 
 * Run this with: npx convex run migrations:migrateReactions
 */
export const migrateReactions = mutation({
    args: {},
    handler: async (ctx) => {
        const messages = await ctx.db.query("messages").collect();
        let count = 0;

        for (const msg of messages) {
            // If reactions is not an array (i.e. it's the old object format or empty object)
            if (!Array.isArray(msg.reactions)) {
                await ctx.db.patch(msg._id, {
                    reactions: []
                });
                count++;
            }
        }

        return { migratedCount: count };
    },
});
