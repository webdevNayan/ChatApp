"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoaded, isSignedIn } = useUser();
    const syncUser = useMutation(api.users.syncUser);
    const currentUser = useQuery(
        api.users.getByClerkId,
        isSignedIn && user ? { clerkId: user.id } : "skip"
    );

    // Broadcast online/offline status in real-time
    useOnlineStatus({ clerkId: isSignedIn ? user?.id : null });

    // Sync the Clerk user into Convex on mount and when user profile changes
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return;

        syncUser({
            clerkId: user.id,
            name: user.fullName ?? user.username ?? "Anonymous",
            email: user.primaryEmailAddress?.emailAddress,
            imageUrl: user.imageUrl,
        }).catch(console.error);
    }, [isLoaded, isSignedIn, user, syncUser]);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar — always visible on desktop; slide-in on mobile */}
                <Sidebar currentUser={currentUser ?? null} />

                {/* Main content area */}
                <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    {children}
                </main>
            </div>
        </TooltipProvider>
    );
}
