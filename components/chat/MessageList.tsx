"use client";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { MessageItem } from "./MessageItem";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import type { MessageWithSender, Id } from "@/types";

interface MessageListProps {
    messages: MessageWithSender[];
    currentUserId: Id<"users">;
    conversationId: Id<"conversations">;
}

export function MessageList({
    messages,
    currentUserId,
    conversationId,
}: MessageListProps) {
    const { scrollRef, isNearBottom, scrollToBottom, checkScroll } =
        useAutoScroll(messages);

    if (messages === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col">
            {/* Scrollable container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8 select-none">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center">
                            <span className="text-3xl">👋</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">Say hello!</p>
                            <p className="text-sm text-muted-foreground">
                                Start the conversation with a message.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isLastFromUser =
                            messages[index + 1]?.senderId !== message.senderId;

                        return (
                            <MessageItem
                                key={message._id}
                                message={message}
                                isMe={message.senderId === currentUserId}
                                currentUserId={currentUserId}
                                showAvatar={isLastFromUser && message.senderId !== currentUserId}
                            />
                        );
                    })
                )}
            </div>

            {/* Scroll to bottom button (FAB) */}
            {!isNearBottom && (
                <Button
                    size="icon"
                    className="absolute bottom-4 right-6 rounded-full shadow-lg ring-1 ring-border bg-card hover:bg-muted text-foreground animate-in fade-in slide-in-from-bottom-2 duration-200"
                    onClick={() => scrollToBottom()}
                >
                    <ChevronDown className="w-5 h-5" />
                </Button>
            )}
        </div>
    );
}
