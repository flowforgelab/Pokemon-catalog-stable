# Pokemon Catalog - Stable Version

A complete rebuild using proven, stable technologies. This is the target architecture for migrating from the complex production system.

## 🚀 Migration Status

**Status**: Active Migration Target (June 2025)  
**Timeline**: 3-4 weeks to full production  
**Progress**: See [MIGRATION-STATUS.md](./MIGRATION-STATUS.md)

This stable version will replace the current production system that has:
- OAuth authentication loops (Better Auth + Next.js 15 incompatibility)
- Complex multi-service architecture (Vercel + Railway + Supabase)
- GraphQL overhead for simple REST needs

## Why This Approach Works

1. **Clerk Authentication**: 
   - Handles ALL OAuth complexity
   - 5-minute setup vs weeks of debugging
   - Works perfectly with Next.js 14
   - Just works™️

2. **Vercel Platform**:
   - Frontend + API + Database in one place
   - No CORS issues
   - Automatic scaling
   - 54-69% cost reduction

3. **Stable Versions**:
   - Next.js 14 (LTS) - no experimental bugs
   - React 18 (stable) - proven in production
   - No bleeding-edge compatibility issues

## Quick Start (For Development)

1. Create a Clerk account at https://clerk.com
2. Create a new application and get your API keys
3. Set up Google OAuth in Clerk dashboard (2 clicks)
4. Create Vercel Postgres database
5. Copy `.env.example` to `.env.local` and fill in values
6. Run `npm install && npm run dev`

## Architecture

### Current Production (Complex)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway        │────▶│   Supabase      │
│  (Next.js 15)   │     │ (NestJS/GraphQL) │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### New Architecture (Simple)
```
┌─────────────────┐
│     Vercel      │
├─────────────────┤
│   Next.js 14    │
│   API Routes    │
│ Vercel Postgres │
│     Clerk       │
└─────────────────┘
```

One platform. No complexity. It just works.

## Features to Migrate

All features from production will be migrated:
- ✅ 18,555+ Pokemon cards with search
- ✅ Collection management with value tracking
- ✅ Deck builder with validation
- ✅ AI-powered deck analysis
- ✅ Real-time pricing from TCGPlayer
- ✅ User profiles and social features

## Migration Resources

- 📋 [Migration Document](./MIGRATION.md) - Complete migration plan with progress tracking
- 🔧 [Claude.md](./CLAUDE.md) - AI assistant context

## For Developers

This codebase will become the new production system. During migration:
1. Follow the patterns established here (Clerk, API routes, Prisma)
2. Don't add Next.js 15 or React 19 features
3. Keep dependencies stable and proven
4. Test thoroughly - this will handle real users soon