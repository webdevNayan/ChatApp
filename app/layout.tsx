import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/common/ConvexClientProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ChatApp | Real-Time Messaging",
  description: "A production-quality real-time chat application built with Next.js, Convex, and Clerk.",
};

/**
 * Root Layout
 * 
 * Implements ClerkProvider and ConvexClientProvider at the top level.
 * Uses modern Next.js 14 App Router patterns.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased bg-background text-foreground">
          <ConvexClientProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
