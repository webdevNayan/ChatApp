"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Id } from "@/types";

interface TypingIndicatorProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
}

export function TypingIndicator({
    conversationId,
    currentUserId,
}: TypingIndicatorProps) {
    const typingUsers = useQuery(api.presence.getTypingUsers, {
        conversationId,
        currentUserId,
    });

    if (!typingUsers || typingUsers.length === 0) return null;

    return (
        <div className="px-5 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex -space-x-1.5 overflow-hidden">
                {typingUsers.slice(0, 3).map((user) => (
                    <Avatar key={user?._id} className="h-4 w-4 border border-background">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="text-[6px] bg-muted">
                            {user?.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>

            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="font-semibold italic">
                    {typingUsers.length === 1
                        ? typingUsers[0]?.name
                        : `${typingUsers.length} people`}
                </span>
                is typing
                <span className="flex gap-0.5 ml-0.5">
                    <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full animate-bounce" />
                </span>
            </p>
        </div>
    );
}
