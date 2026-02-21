import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Typing indicators — ephemeral presence data.
 *
 * Strategy:
 *  - On keystroke : upsert a typingIndicators row with `updatedAt = now()`
 *  - On query     : return only rows where `updatedAt > now() - TYPING_TTL_MS`
 *  - Client-side  : debounce 2 s after last keystroke then call clearTyping
 *
 * We don't run a scheduled cleanup here to keep things simple; instead the
 * query filters stale rows so they are invisible even if not deleted.
 */
const TYPING_TTL_MS = 3_000; // row considered stale after 3 seconds

// ---------------------------------------------------------------------------
// setTyping — upsert the user's typing indicator for a conversation.
// ---------------------------------------------------------------------------
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { updatedAt: Date.now() });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: args.userId,
                updatedAt: Date.now(),
            });
        }
    },
});

// ---------------------------------------------------------------------------
// clearTyping — removes the user's typing indicator explicitly.
// Called by the client 2 s after the last keystroke.
// ---------------------------------------------------------------------------
export const clearTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

// ---------------------------------------------------------------------------
// getTypingUsers — returns users currently typing (excluding self).
// Subscribed to in real-time on the conversation page.
// ---------------------------------------------------------------------------
export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
        currentUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const cutoff = Date.now() - TYPING_TTL_MS;

        const rows = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) =>
                q.and(
                    q.gt(q.field("updatedAt"), cutoff),
                    q.neq(q.field("userId"), args.currentUserId)
                )
            )
            .collect();

        // Resolve user names for display
        const users = await Promise.all(
            rows.map(async (row) => {
                const user = await ctx.db.get(row.userId);
                return user
                    ? { _id: user._id, name: user.name, imageUrl: user.imageUrl }
                    : null;
            })
        );

        return users.filter(Boolean);
    },
});
