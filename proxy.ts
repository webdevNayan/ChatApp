import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * proxy.ts (Middleware Logic)
 * 
 * This file handles route protection using Clerk's modern middleware.
 * NOTE: Per project requirements, this is named proxy.ts instead of middleware.ts.
 * In a standard Next.js environment, this logic would typically reside in middleware.ts.
 */

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static assets
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
