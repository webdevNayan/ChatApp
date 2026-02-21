"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

/**
 * ConvexClientProvider — wraps children with the Convex React client.
 * The NEXT_PUBLIC_CONVEX_URL is set automatically by `npx convex dev`.
 */
export function ConvexClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210";

    const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

    return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
