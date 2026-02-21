import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ---------------------------------------------------------------------------
// getOrCreateDM — finds an existing 1-1 conversation or creates one.
// "Idempotent create" pattern so duplicate DMs are never created.
// ---------------------------------------------------------------------------
export const getOrCreateDM = mutation({
    args: {
        currentUserId: v.id("users"),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { currentUserId, otherUserId } = args;

        // Search for an existing 1-1 conversation between these two participants
        const existing = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("isGroup"), false))
            .collect();

        const found = existing.find((conv) => {
            const ids = conv.participants.map(String);
            return (
                ids.length === 2 &&
                ids.includes(String(currentUserId)) &&
                ids.includes(String(otherUserId))
            );
        });

        if (found) return found._id;

        return await ctx.db.insert("conversations", {
            participants: [currentUserId, otherUserId],
            isGroup: false,
            lastMessageAt: Date.now(),
        });
    },
});

// ---------------------------------------------------------------------------
// createGroupConversation — creates a named group chat.
// ---------------------------------------------------------------------------
export const createGroupConversation = mutation({
    args: {
        name: v.string(),
        participantIds: v.array(v.id("users")),
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversations", {
            participants: args.participantIds,
            isGroup: true,
            name: args.name,
            lastMessageAt: Date.now(),
            createdBy: args.createdBy,
        });
    },
});

// ---------------------------------------------------------------------------
// listConversations — returns all conversations the current user is part of,
// sorted by most recent message (descending).
// Each item is enriched with the other participant's info (for DMs) and
// the latest message preview.
// ---------------------------------------------------------------------------
export const listConversations = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("conversations")
            .withIndex("by_last_message", (q) => q.gt("lastMessageAt", 0))
            .order("desc")
            .collect();

        const userConvs = all.filter((c) =>
            c.participants.map(String).includes(String(args.userId))
        );

        // Enrich each conversation with participant details + last message
        const enriched = await Promise.all(
            userConvs.map(async (conv) => {
                // Fetch all participants
                const participants = await Promise.all(
                    conv.participants.map((id) => ctx.db.get(id))
                );

                // Last message preview
                const lastMsg = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation_created", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .order("desc")
                    .first();

                return {
                    ...conv,
                    participants: participants.filter(Boolean),
                    lastMessage: lastMsg ?? null,
                };
            })
        );

        return enriched;
    },
});

// ---------------------------------------------------------------------------
// getConversation — single conversation with participants enriched.
// ---------------------------------------------------------------------------
export const getConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const conv = await ctx.db.get(args.conversationId);
        if (!conv) return null;

        const participants = await Promise.all(
            conv.participants.map((id) => ctx.db.get(id))
        );

        return { ...conv, participants: participants.filter(Boolean) };
    },
});

// ---------------------------------------------------------------------------
// updateLastMessageAt — called after each new message so sidebar stays sorted.
// ---------------------------------------------------------------------------
export const updateLastMessageAt = mutation({
    args: {
        conversationId: v.id("conversations"),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            lastMessageAt: args.timestamp,
        });
    },
});
