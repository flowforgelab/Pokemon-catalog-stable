# CLAUDE.md

This file provides guidance to Claude Code when working with the Pokemon TCG Catalog (Stable Version).

## Project Overview

A stable, production-ready Pokemon TCG catalog application built with:
- **Next.js 14.2.18** (LTS) + React 18.3.1 (stable)
- **Clerk Authentication** (working Google OAuth)
- **Single deployment on Vercel** (frontend + API + database)
- **Prisma ORM** with PostgreSQL

**Key Decision**: Complete rebuild from the previous Next.js 15 + React 19 app due to authentication issues with experimental versions.

## Current Status

### ✅ Completed
- Stable Next.js 14 app with App Router
- Clerk authentication with Google OAuth (5-minute setup, just works™)
- Basic Pokemon card display component
- Cards browsing page (`/cards`)
- Protected dashboard route
- Prisma schema for cards, collections, and decks
- Ready for Vercel deployment

### 🚧 Next Steps
1. Deploy to Vercel with environment variables
2. Add Vercel Postgres database
3. Connect to Pokemon TCG API for real card data
4. Implement collection management
5. Add deck building features
6. Implement search and filtering

## Essential Commands

```bash
# Development
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server

# Database (after adding Vercel Postgres)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- **Auth**: Clerk (handles all OAuth complexity)
- **Database**: Prisma ORM + Vercel Postgres
- **Deployment**: Vercel (everything in one place)
- **UI Components**: Custom components with shadcn/ui patterns

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── cards/          # Cards browsing page
│   ├── dashboard/      # Protected dashboard
│   └── layout.tsx      # Root layout with Clerk
├── components/         # React components
│   ├── pokemon-card.tsx
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and types
└── middleware.ts      # Clerk authentication middleware
```

### Authentication Flow
- Clerk handles everything via `clerkMiddleware()` in `middleware.ts`
- `<ClerkProvider>` wraps the app in `layout.tsx`
- Protected routes use `auth()` from `@clerk/nextjs/server`
- Public pages use `<SignedIn>` and `<SignedOut>` components

## Environment Variables

Required for deployment:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (provided by Vercel Postgres)
DATABASE_URL=postgres://...
```

## Key Design Decisions

1. **Stable over Cutting Edge**: Next.js 14 + React 18 instead of experimental versions
2. **Clerk for Auth**: Eliminated all OAuth complexity that was failing with Better Auth
3. **Single Platform**: Everything on Vercel to avoid CORS and deployment complexity
4. **Prisma ORM**: Type-safe database queries with existing schema from old project

## Common Tasks

### Adding a Protected Page
```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  
  // Page content here
}
```

### Using Clerk in Client Components
```typescript
"use client";
import { useUser } from "@clerk/nextjs";

export function MyComponent() {
  const { user, isLoaded } = useUser();
  // Component logic
}
```

## Migration Notes

This is a complete rebuild of `pokemon-catalog-production` which had:
- Next.js 15 + React 19 (experimental, causing issues)
- Better Auth (failed with OAuth "invalid_code" errors)
- Split deployment (Vercel + Railway + Supabase)
- Complex GraphQL API setup

The new approach simplifies everything while keeping the core Pokemon functionality.