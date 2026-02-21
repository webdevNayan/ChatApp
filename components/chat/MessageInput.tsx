"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip } from "lucide-react";
import { useTyping } from "@/hooks/useTyping";
import { toast } from "sonner";
import type { Id } from "@/types";

interface MessageInputProps {
    conversationId: Id<"conversations">;
    senderId: Id<"users">;
}

export function MessageInput({ conversationId, senderId }: MessageInputProps) {
    const [body, setBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendMessage = useMutation(api.messages.sendMessage);

    // Typing indicator logic
    const { performTyping: handleTyping } = useTyping(conversationId, senderId);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!body.trim() || isSending) return;

        try {
            setIsSending(true);
            await sendMessage({
                conversationId,
                senderId,
                body: body.trim(),
            });
            setBody("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBody(e.target.value);
        handleTyping();
    };

    return (
        <div className="p-4 bg-background border-t border-border shrink-0">
            <form
                onSubmit={handleSend}
                className="max-w-4xl mx-auto flex items-end gap-2"
            >
                <div className="flex items-center gap-1 mb-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground rounded-full"
                        disabled
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground rounded-full"
                        disabled
                    >
                        <Smile className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1">
                    <Input
                        placeholder="Type a message..."
                        value={body}
                        onChange={handleChange}
                        className="h-10 border-none bg-muted/60 focus-visible:ring-1 focus-visible:ring-blue-600 rounded-2xl px-4 py-2"
                        autoComplete="off"
                        disabled={isSending}
                    />
                </div>

                <Button
                    type="submit"
                    size="icon"
                    disabled={!body.trim() || isSending}
                    className="h-10 w-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
