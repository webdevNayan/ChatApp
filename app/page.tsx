import { redirect } from "next/navigation";

/**
 * Root page — simply redirects to the chat layout.
 * Clerk middleware protects the (chat) routes; unauthenticated users
 * will be sent to /sign-in automatically.
 */
export default function RootPage() {
  redirect("/conversations");
}
