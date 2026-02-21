"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const TYPING_TIMEOUT = 2000; // 2 seconds

/**
 * useTyping Hook
 * 
 * Implements a 2-second debounce logic for typing indicators.
 * Communicates with Convex to update presence state.
 */
export function useTyping(conversationId: Id<"conversations">, userId: Id<"users"> | undefined) {
    const setTyping = useMutation(api.presence.setTyping);
    const clearTyping = useMutation(api.presence.clearTyping);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const performTyping = useCallback(() => {
        if (!userId) return;

        // Set typing state in Convex
        setTyping({ conversationId, userId }).catch(console.error);

        // Clear existing timer
        if (timerRef.current) clearTimeout(timerRef.current);

        // Start 2-second countdown to clear typing
        timerRef.current = setTimeout(() => {
            clearTyping({ conversationId, userId }).catch(console.error);
        }, TYPING_TIMEOUT);
    }, [conversationId, userId, setTyping, clearTyping]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { performTyping };
}
