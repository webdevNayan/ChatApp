"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatConversationTime } from "@/lib/date";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import type { ConversationWithDetails, UserDoc } from "@/types";

interface ConversationItemProps {
    conversation: ConversationWithDetails;
    currentUser: UserDoc;
    isActive: boolean;
}

export function ConversationItem({
    conversation,
    currentUser,
    isActive,
}: ConversationItemProps) {
    const { unreadCount } = useUnreadCount({
        conversationId: conversation._id,
        userId: currentUser._id,
    });

    // For DMs, find the other participant
    const otherParticipant = conversation.isGroup
        ? null
        : conversation.participants.find((p) => p?._id !== currentUser._id);

    const displayName = conversation.isGroup
        ? conversation.name
        : otherParticipant?.name || "Unknown User";

    const displayImage = conversation.isGroup
        ? conversation.groupImageUrl
        : otherParticipant?.imageUrl;

    const lastMessageText = conversation.lastMessage
        ? conversation.lastMessage.isDeleted
            ? "Message deleted"
            : conversation.lastMessage.body
        : "No messages yet";

    return (
        <Link
            href={`/conversations/${conversation._id}`}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                isActive
                    ? "bg-blue-600/10 text-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border border-border/50">
                    <AvatarImage src={displayImage} alt={displayName} />
                    <AvatarFallback className="bg-blue-600/5 text-blue-500 font-medium">
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Online Status Dot (only for DMs) */}
                {!conversation.isGroup && otherParticipant?.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                        "text-sm font-semibold truncate",
                        isActive || unreadCount > 0 ? "text-foreground" : "text-slate-300"
                    )}>
                        {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {conversation.lastMessageAt > 0 && formatConversationTime(conversation.lastMessageAt)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <p className={cn(
                        "text-xs truncate max-w-[140px]",
                        unreadCount > 0 ? "text-slate-200 font-semibold" : "text-muted-foreground"
                    )}>
                        {conversation.lastMessage?.senderId === currentUser._id && "You: "}
                        {lastMessageText}
                    </p>

                    {unreadCount > 0 && (
                        <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-blue-600 hover:bg-blue-600 text-[10px] font-bold border-none">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    );
}
