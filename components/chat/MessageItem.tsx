"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/date";
import { MoreHorizontal, Trash2, Smile } from "lucide-react";
import { FIXED_REACTIONS, type MessageWithSender, type Id } from "@/types";
import { toast } from "sonner";

interface MessageItemProps {
    message: MessageWithSender;
    isMe: boolean;
    currentUserId: Id<"users">;
    showAvatar: boolean;
}

export function MessageItem({
    message,
    isMe,
    currentUserId,
    showAvatar,
}: MessageItemProps) {
    const deleteMessage = useMutation(api.messages.softDeleteMessage);
    const toggleReaction = useMutation(api.messages.toggleReaction);

    const handleDelete = async () => {
        try {
            await deleteMessage({
                messageId: message._id,
                requestingUserId: currentUserId,
            });
            toast.success("Message deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete message");
        }
    };

    const handleReaction = async (emoji: string) => {
        try {
            await toggleReaction({
                messageId: message._id,
                userId: currentUserId,
                emoji,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            className={cn(
                "flex items-end gap-2 group animate-in fade-in duration-300",
                isMe ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar column */}
            <div className="w-8 shrink-0">
                {showAvatar && (
                    <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={message.sender?.imageUrl} />
                        <AvatarFallback className="text-[10px] bg-blue-600/10 text-blue-500">
                            {message.sender?.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            {/* Message content */}
            <div
                className={cn(
                    "flex flex-col max-w-[75%] sm:max-w-[65%]",
                    isMe ? "items-end" : "items-start"
                )}
            >
                <div className="flex items-center gap-2 mb-1 px-1">
                    {!isMe && showAvatar && (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                            {message.sender?.name}
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>

                <div className="relative group/content flex items-center gap-2">
                    {/* Reaction / Actions trigger (hover) */}
                    {isMe && !message.isDeleted && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            <MessageActions onReaction={handleReaction} onDelete={handleDelete} />
                        </div>
                    )}

                    {/* Bubble */}
                    <div
                        className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative",
                            isMe
                                ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-900/10"
                                : "bg-muted text-foreground rounded-bl-none border border-border/20",
                            message.isDeleted && "italic text-muted-foreground opacity-70 bg-muted/30"
                        )}
                    >
                        {message.isDeleted ? "This message was deleted" : message.body}

                        {/* Reactions display */}
                        {message.reactions && message.reactions.length > 0 && (
                            <div
                                className={cn(
                                    "absolute -bottom-4 flex flex-wrap gap-1 z-10",
                                    isMe ? "right-0" : "left-0"
                                )}
                            >
                                {(() => {
                                    // Group reactions by emoji
                                    const grouped = message.reactions.reduce((acc, r) => {
                                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>);

                                    return Object.entries(grouped).map(([emoji, count]) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className="flex items-center gap-1 bg-card border border-border px-1.5 py-0.5 rounded-full text-[10px] shadow-sm hover:scale-110 transition-transform"
                                        >
                                            <span>{emoji}</span>
                                            <span className="font-medium">{count}</span>
                                        </button>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    {!isMe && !message.isDeleted && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            <MessageActions onReaction={handleReaction} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageActions({
    onReaction,
    onDelete,
}: {
    onReaction: (emoji: string) => void;
    onDelete?: () => void;
}) {
    return (
        <div className="flex items-center gap-0.5">
            <Popover>
                <PopoverTrigger asChild>
                    <button className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                        <Smile className="w-3.5 h-3.5" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-1 flex gap-1 rounded-full shadow-xl border-border bg-card">
                    {FIXED_REACTIONS.map((r) => (
                        <button
                            key={r.emoji}
                            onClick={() => onReaction(r.emoji)}
                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-lg transition-transform hover:scale-125"
                            title={r.label}
                        >
                            {r.emoji}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>

            {onDelete && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-32">
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-red-500 focus:text-red-500"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
