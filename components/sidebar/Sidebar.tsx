"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { UserDoc } from "@/types";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { ConversationList } from "@/components/sidebar/ConversationList";
import { NewConversationModal } from "@/components/sidebar/NewConversationModal";

interface SidebarProps {
    currentUser: UserDoc | null;
}

export function Sidebar({ currentUser }: SidebarProps) {
    const { user: clerkUser } = useUser();
    const [isNewConvOpen, setIsNewConvOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const conversations = useQuery(
        api.conversations.listConversations,
        currentUser ? { userId: currentUser._id } : "skip"
    );

    if (!mounted) {
        return <aside className="hidden md:flex w-80 flex-col border-r border-border bg-card h-full shrink-0" />;
    }

    return (
        <>
            {/* Sidebar panel */}
            <aside className="hidden md:flex w-80 flex-col border-r border-border bg-card h-full shrink-0">
                <SidebarHeader
                    currentUser={currentUser}
                    onNewConversation={() => setIsNewConvOpen(true)}
                />

                <ConversationList
                    conversations={conversations}
                    currentUser={currentUser}
                />
            </aside>

            {/* New conversation modal */}
            <NewConversationModal
                isOpen={isNewConvOpen}
                onClose={() => setIsNewConvOpen(false)}
                currentUser={currentUser}
                currentClerkId={clerkUser?.id ?? ""}
            />
        </>
    );
}
