"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useAutoScroll Hook
 * 
 * Smart scroll logic:
 * 1. Automatically scrolls to bottom when new messages arrive if the user is already near the bottom.
 * 2. Prevents auto-scroll if the user has manually scrolled up to read history.
 */
export function useAutoScroll<T>(dependency: T) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        // 100px threshold for being "near bottom"
        const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
        setIsNearBottom(isAtBottom);
    };

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        if (isNearBottom) {
            scrollToBottom();
        }
    }, [dependency]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto");
    }, []);

    return { scrollRef, checkScroll, scrollToBottom, isNearBottom };
}
