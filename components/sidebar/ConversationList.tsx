"use client";

import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import type { ConversationWithDetails, UserDoc } from "@/types";

interface ConversationListProps {
    conversations: ConversationWithDetails[] | undefined;
    currentUser: UserDoc | null;
}

export function ConversationList({
    conversations,
    currentUser,
}: ConversationListProps) {
    const pathname = usePathname();

    if (conversations === undefined || !currentUser) {
        return (
            <div className="flex-1 px-4">
                <LoadingSkeleton variant="sidebar" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Start a new chat to begin messaging.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
                {conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        currentUser={currentUser}
                        isActive={pathname.includes(conversation._id)}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
