import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ---------------------------------------------------------------------------
// syncUser — called on every sign-in via useUser() hook in the client.
// Creates a user record if it doesn't exist yet, otherwise updates presence.
// ---------------------------------------------------------------------------
export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            // Update mutable fields in case they changed in Clerk
            await ctx.db.patch(existing._id, {
                name: args.name,
                imageUrl: args.imageUrl,
                email: args.email,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

// ---------------------------------------------------------------------------
// setOnlineStatus — called when the browser tab gains/loses focus,
// or on beforeunload to mark user as offline.
// ---------------------------------------------------------------------------
export const setOnlineStatus = mutation({
    args: {
        clerkId: v.string(),
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            isOnline: args.isOnline,
            lastSeen: Date.now(),
        });
    },
});

// ---------------------------------------------------------------------------
// getByClerkId — resolve a Convex user _id from a Clerk userId string.
// ---------------------------------------------------------------------------
export const getByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// ---------------------------------------------------------------------------
// listUsers — returns all users except the current one.
// Used for the "New Conversation" user picker.
// ---------------------------------------------------------------------------
export const listUsers = query({
    args: { currentClerkId: v.string() },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("users").collect();
        return all.filter((u) => u.clerkId !== args.currentClerkId);
    },
});

// ---------------------------------------------------------------------------
// searchUsers — server-side fuzzy search by display name.
// The client also debounces the input before calling this.
// ---------------------------------------------------------------------------
export const searchUsers = query({
    args: {
        query: v.string(),
        currentClerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("users").collect();
        const term = args.query.toLowerCase();

        return all.filter(
            (u) =>
                u.clerkId !== args.currentClerkId &&
                ((u.name || "").toLowerCase().includes(term) ||
                    (u.email || "").toLowerCase().includes(term))
        );
    },
});

// ---------------------------------------------------------------------------
// getUserById — fetch a single user by their Convex _id.
// ---------------------------------------------------------------------------
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
