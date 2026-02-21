import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema Design
 * 
 * Optimized for real-time chat with proper indexing for scale.
 */
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    email: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_isOnline", ["isOnline"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    lastMessageAt: v.number(),
  }).index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
    isDeleted: v.boolean(),
    /**
     * Reactions stored as a record mapping emoji to array of user IDs
     * Example: { "👍": ["user1", "user2"], "❤️": ["user3"] }
     */
    reactions: v.record(v.string(), v.array(v.id("users"))),
  }).index("by_conversationId", ["conversationId"]),

  conversationReads: defineTable({
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    lastReadAt: v.number(),
  }).index("by_userId_conversationId", ["userId", "conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_userId", ["conversationId", "userId"]),
});
