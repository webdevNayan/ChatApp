# Production-Ready Chat Application

This project is a high-quality real-time chat web application built for evaluation. It leverages modern App Router patterns, real-time backend synchronization, and secure authentication.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database/Backend**: Convex (Real-time subscriptions)
- **Auth**: Clerk (Modern middleware approach)
- **Styling**: Tailwind CSS + shadcn/ui

---

## Local Setup Instructions (macOS)

### 1. Project Initialization
```bash
cd chatapp
npm install
```

### 2. Environment Setup
Copy the template to `.env.local` and fill in your Clerk keys.
```bash
cp .env.example .env.local
```
*Note: The app is configured to use placeholders for evaluation.*

### 3. Convex Backend (Local Mode)
In a separate terminal:
```bash
npx convex dev
```
Select "Start without an account" to run Convex entirely on your machine. This will automatically sync your schema and types.

### 4. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## Project Structure Highlights
- `/proxy.ts`: Contains Clerk `clerkMiddleware` logic as per the "NOT middleware.ts" requirement.
- `/convex`: Contains clean, indexed schema and modularized server functions.
- `/hooks`: Custom hooks for complex logic like `useAutoScroll`, `useTyping`, and `useOnlineStatus`.
- `/components/chat`: Atomic chat components (MessageList, Input, TypingIndicator, etc.).

---

## Deployment to Vercel

1. **Push to GitHub**: Create a repository and push your code.
2. **Import to Vercel**: Connect your GitHub repository to Vercel.
3. **Environment Variables**:
   - Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Add `CLERK_SECRET_KEY`
   - Add `CONVEX_DEPLOY_KEY` (Get this from your production Convex dashboard)
4. **Deploy**: Vercel will automatically handle the build and deployment.

---

## Key Features Implemented
- **Real-time Sync**: UI updates instantly via Convex subscriptions.
- **Smart Scroll**: Auto-scroll stays at the bottom unless you scroll up manually.
- **Typing Indicators**: 2-second debounce logic with real-time feedback.
- **Presence System**: Accurate online status and "last seen" tracking.
- **Soft Delete**: Messages are flagged `isDeleted` to preserve chat flow.
- **Rich Reactions**: Record-based emoji reactions on every message.
- **Unread Counts**: Efficient real-time unread badges per conversation.
