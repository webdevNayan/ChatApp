"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
    variant: "sidebar" | "conversation" | "message";
    count?: number;
}

export function LoadingSkeleton({ variant, count = 5 }: LoadingSkeletonProps) {
    if (variant === "sidebar") {
        return (
            <div className="space-y-4 py-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-1/2 bg-muted/60 animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "conversation") {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Skeleton */}
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
                    </div>
                </div>

                {/* Messages Skeleton */}
                <div className="flex-1 p-4 space-y-6 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-end gap-2",
                                i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                            )}
                        >
                            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                            <div
                                className={cn(
                                    "h-10 w-1/3 min-w-[120px] bg-muted animate-pulse rounded-2xl",
                                    i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"
                                )}
                            />
                        </div>
                    ))}
                </div>

                {/* Input Skeleton */}
                <div className="p-4 border-t border-border flex gap-2">
                    <div className="flex-1 h-10 bg-muted animate-pulse rounded-2xl" />
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                </div>
            </div>
        );
    }

    return null;
}
