/**
 * useUnreadCount — subscribes to the real-time unread message count
 * for a given conversation, returning the count and a markRead helper.
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseUnreadCountProps {
    conversationId: Id<"conversations">;
    userId: Id<"users"> | null;
}

export function useUnreadCount({ conversationId, userId }: UseUnreadCountProps) {
    const count = useQuery(
        api.messages.getUnreadCount,
        userId ? { conversationId, userId } : "skip"
    );

    const markAsReadMutation = useMutation(api.messages.markAsRead);

    const markRead = useCallback(() => {
        if (!userId) return;
        markAsReadMutation({ conversationId, userId }).catch(console.error);
    }, [conversationId, userId, markAsReadMutation]);

    return {
        unreadCount: count ?? 0,
        markRead,
    };
}
