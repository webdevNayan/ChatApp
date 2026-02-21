import { ClerkProvider } from "@clerk/nextjs";

/**
 * ClerkProviderWrapper — wraps children with ClerkProvider.
 *
 * When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is a dummy value (local dev),
 * Clerk will show auth errors but the UI will still render.
 * Replace the env value with a real key when deploying to production.
 */
export function ClerkProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "dummy_key"}
            appearance={{
                variables: {
                    colorPrimary: "hsl(217, 91%, 60%)",
                    colorBackground: "hsl(222, 47%, 11%)",
                    colorText: "hsl(210, 40%, 98%)",
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
}
