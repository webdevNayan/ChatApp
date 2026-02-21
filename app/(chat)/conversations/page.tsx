import { MessageSquare } from "lucide-react";

/**
 * /conversations — root conversations page.
 * Shown on desktop when no conversation is selected.
 */
export default function ConversationsPage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center h-full select-none">
            <div className="flex flex-col items-center gap-4 text-center px-4">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                </div>

                {/* Heading */}
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">
                        Your messages
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Select a conversation from the sidebar or start a new one to begin
                        chatting.
                    </p>
                </div>
            </div>
        </div>
    );
}
