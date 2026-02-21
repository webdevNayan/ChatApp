/**
 * useOnlineStatus — broadcasts the current user's online/offline status
 * to Convex via the `setOnlineStatus` mutation.
 *
 * Listens to:
 *  - document visibilitychange (tab focus/blur)
 *  - window beforeunload (mark offline before page closes)
 *
 * Called once in a high-level layout so it runs for the entire session.
 */

"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UseOnlineStatusProps {
    clerkId: string | null | undefined;
}

export function useOnlineStatus({ clerkId }: UseOnlineStatusProps) {
    const setStatus = useMutation(api.users.setOnlineStatus);

    useEffect(() => {
        if (!clerkId) return;

        // Mark online immediately
        setStatus({ clerkId, isOnline: true }).catch(console.error);

        const handleVisibilityChange = () => {
            setStatus({
                clerkId,
                isOnline: document.visibilityState === "visible",
            }).catch(console.error);
        };

        const handleBeforeUnload = () => {
            // Use sendBeacon for reliability on page close
            setStatus({ clerkId, isOnline: false }).catch(console.error);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            setStatus({ clerkId, isOnline: false }).catch(console.error);
        };
    }, [clerkId, setStatus]);
}
