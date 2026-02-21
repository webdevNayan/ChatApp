import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ---------------------------------------------------------------------------
// sendMessage — inserts a new message and updates the conversation timestamp.
// ---------------------------------------------------------------------------
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            body: args.body,
            createdAt: now,
            isDeleted: false,
            reactions: {},
        });

        // Keep conversation sorted in the sidebar
        await ctx.db.patch(args.conversationId, { lastMessageAt: now });

        return messageId;
    },
});

// ---------------------------------------------------------------------------
// listMessages — real-time subscription; Convex re-runs on any change.
// Returns messages for a conversation in ascending order (oldest first).
// ---------------------------------------------------------------------------
export const listMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich each message with sender info
        const enriched = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return { ...msg, sender };
            })
        );

        return enriched;
    },
});

// ---------------------------------------------------------------------------
// softDeleteMessage — sets isDeleted=true; body is replaced on the client.
// The record is kept so reactions, reply threads, etc. can reference it.
// ---------------------------------------------------------------------------
export const softDeleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        requestingUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const msg = await ctx.db.get(args.messageId);
        if (!msg) throw new Error("Message not found");
        if (String(msg.senderId) !== String(args.requestingUserId)) {
            throw new Error("Unauthorized: cannot delete another user's message");
        }

        await ctx.db.patch(args.messageId, { isDeleted: true });
    },
});

// ---------------------------------------------------------------------------
// toggleReaction — adds or removes a user's reaction on a message.
// Emoji is one of the fixed set defined on the client.
// ---------------------------------------------------------------------------
export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const msg = await ctx.db.get(args.messageId);
        if (!msg) throw new Error("Message not found");

        const reactions = { ...(msg.reactions ?? {}) };
        const existing = reactions[args.emoji] ?? [];
        const userIdStr = String(args.userId);

        if (existing.map(String).includes(userIdStr)) {
            // Remove the reaction
            reactions[args.emoji] = existing.filter(
                (id) => String(id) !== userIdStr
            ) as typeof existing;
            if (reactions[args.emoji].length === 0) {
                delete reactions[args.emoji];
            }
        } else {
            // Add the reaction
            reactions[args.emoji] = [...existing, args.userId];
        }

        await ctx.db.patch(args.messageId, { reactions });
    },
});

// ---------------------------------------------------------------------------
// getUnreadCount — counts messages after the user's lastReadAt timestamp.
// Subscribed to in real-time for badge updates.
// ---------------------------------------------------------------------------
export const getUnreadCount = query({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Get last-read record for this user in this conversation
        const readRecord = await ctx.db
            .query("conversationReads")
            .withIndex("by_userId_conversationId", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        const lastReadAt = readRecord?.lastReadAt ?? 0;

        // Count messages sent after lastReadAt, excluding own messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) =>
                q.and(
                    q.gt(q.field("createdAt"), lastReadAt),
                    q.neq(q.field("senderId"), args.userId),
                    q.eq(q.field("isDeleted"), false)
                )
            )
            .collect();

        return messages.length;
    },
});

// ---------------------------------------------------------------------------
// markAsRead — upserts a conversationReads record with the current timestamp.
// Called when the user opens a conversation.
// ---------------------------------------------------------------------------
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("conversationReads")
            .withIndex("by_userId_conversationId", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadAt: Date.now() });
        } else {
            await ctx.db.insert("conversationReads", {
                userId: args.userId,
                conversationId: args.conversationId,
                lastReadAt: Date.now(),
            });
        }
    },
});
