"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.conversationId as Id<"conversations">;

    const { user: clerkUser } = useUser();

    // Resolve Convex userId from Clerk
    const currentUser = useQuery(
        api.users.getByClerkId,
        clerkUser ? { clerkId: clerkUser.id } : "skip"
    );

    // Fetch conversation with participants
    const conversation = useQuery(api.conversations.getConversation, {
        conversationId,
    });

    // Fetch real-time messages
    const messages = useQuery(api.messages.listMessages, { conversationId });

    if (conversation === undefined || currentUser === undefined) {
        return <LoadingSkeleton variant="conversation" />;
    }

    if (conversation === null || currentUser === null) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Conversation not found.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header — shows name, avatar, online status */}
            <ChatHeader
                conversation={conversation}
                currentUserId={currentUser._id}
            />

            {/* Message list with auto-scroll */}
            <MessageList
                messages={messages ?? []}
                currentUserId={currentUser._id}
                conversationId={conversationId}
            />

            {/* Typing indicator */}
            <TypingIndicator
                conversationId={conversationId}
                currentUserId={currentUser._id}
            />

            {/* Input area */}
            <MessageInput
                conversationId={conversationId}
                senderId={currentUser._id}
            />
        </div>
    );
}
