"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import type { UserDoc } from "@/types";

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserDoc | null;
    currentClerkId: string;
}

export function NewConversationModal({
    isOpen,
    onClose,
    currentUser,
    currentClerkId,
}: NewConversationModalProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [isCreating, setIsCreating] = useState(false);

    // Convex query for searching users with debouncing
    const users = useQuery(api.users.searchUsers, {
        query: debouncedQuery,
        currentClerkId: currentClerkId,
    });

    const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);

    const handleStartDM = async (otherUser: UserDoc) => {
        if (!currentUser || isCreating) return;

        try {
            setIsCreating(true);
            const conversationId = await getOrCreateDM({
                currentUserId: currentUser._id,
                otherUserId: otherUser._id,
            });

            onClose();
            router.push(`/conversations/${conversationId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to start conversation");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4">
                    <DialogTitle>Start a conversation</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people by name or email..."
                            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <ScrollArea className="h-72 -mx-4">
                        <div className="px-4 space-y-1">
                            {users === undefined ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-sm text-muted-foreground">No users found.</p>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleStartDM(user)}
                                        disabled={isCreating}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                                    >
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarImage src={user.imageUrl} />
                                            <AvatarFallback className="bg-blue-600/10 text-blue-400 text-xs">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email || "No email provided"}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
