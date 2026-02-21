import type { Doc, Id } from "@/convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// Re-export base Convex document types for convenience
// ---------------------------------------------------------------------------
export type { Doc, Id };

// ---------------------------------------------------------------------------
// Enriched types — Convex query results with joined data
// ---------------------------------------------------------------------------

export type UserDoc = Doc<"users">;

export type MessageWithSender = Doc<"messages"> & {
    sender: UserDoc | null;
};

export type ConversationWithDetails = Doc<"conversations"> & {
    participants: (UserDoc | null)[];
    lastMessage: MessageWithSender | null;
};

export type TypingUser = {
    _id: Id<"users">;
    name: string;
    imageUrl?: string;
};

// ---------------------------------------------------------------------------
// UI-only types
// ---------------------------------------------------------------------------

export type EmojiReaction = {
    emoji: string;
    label: string;
};

export const FIXED_REACTIONS: EmojiReaction[] = [
    { emoji: "👍", label: "Thumbs up" },
    { emoji: "❤️", label: "Heart" },
    { emoji: "😂", label: "Haha" },
    { emoji: "😮", label: "Wow" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" },
];
