"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Phone, Video, Info, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatLastSeen } from "@/lib/date";
import type { ConversationWithDetails, Id } from "@/types";

interface ChatHeaderProps {
    conversation: ConversationWithDetails;
    currentUserId: Id<"users">;
}

export function ChatHeader({ conversation, currentUserId }: ChatHeaderProps) {
    const markAsRead = useMutation(api.messages.markAsRead);

    // Mark conversation as read when it opens
    useEffect(() => {
        markAsRead({
            conversationId: conversation._id,
            userId: currentUserId,
        }).catch(console.error);
    }, [conversation._id, currentUserId, markAsRead]);

    // For DMs, find the other participant
    const otherParticipant = conversation.isGroup
        ? null
        : conversation.participants.find((p) => p?._id !== currentUserId);

    const displayName = conversation.isGroup
        ? conversation.name
        : otherParticipant?.name || "Unknown User";

    const displayImage = conversation.isGroup
        ? conversation.groupImageUrl
        : otherParticipant?.imageUrl;

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <Link href="/conversations" className="md:hidden">
                    <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>

                <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={displayImage} alt={displayName} />
                        <AvatarFallback className="bg-blue-600/10 text-blue-500 font-semibold">
                            {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {!conversation.isGroup && otherParticipant?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                    )}
                </div>

                <div className="min-w-0">
                    <h1 className="text-sm font-semibold truncate leading-none mb-1">
                        {displayName}
                    </h1>
                    <p className="text-[11px] text-muted-foreground leading-none truncate">
                        {conversation.isGroup ? (
                            `${conversation.participants.length} members`
                        ) : otherParticipant?.isOnline ? (
                            <span className="text-green-500 font-medium">Online</span>
                        ) : otherParticipant?.lastSeen ? (
                            `Last seen ${formatLastSeen(otherParticipant.lastSeen)}`
                        ) : (
                            "Offline"
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hidden sm:flex"
                    disabled
                >
                    <Phone className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hidden sm:flex"
                    disabled
                >
                    <Video className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground"
                    disabled
                >
                    <Info className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
