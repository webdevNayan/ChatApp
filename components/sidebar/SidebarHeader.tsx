"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, MoreHorizontal, LogOut, Settings } from "lucide-react";
import type { UserDoc } from "@/types";

interface SidebarHeaderProps {
    currentUser: UserDoc | null;
    onNewConversation: () => void;
}

export function SidebarHeader({
    currentUser,
    onNewConversation,
}: SidebarHeaderProps) {
    const { user } = useUser();
    const { signOut } = useClerk();

    const initials = currentUser?.name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?";

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            {/* Logo / App name */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="font-semibold text-sm tracking-tight">ChatApp</span>
            </div>

            <div className="flex items-center gap-1">
                {/* New conversation button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={onNewConversation}
                            aria-label="New conversation"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New conversation</TooltipContent>
                </Tooltip>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0"
                            aria-label="User menu"
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user?.imageUrl} alt={currentUser?.name} />
                                <AvatarFallback className="text-xs bg-blue-700 text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium truncate">
                                {currentUser?.name ?? "Loading..."}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentUser?.email ?? user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => signOut({ redirectUrl: "/sign-in" })}
                            className="text-red-500 focus:text-red-500"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
