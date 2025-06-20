# Clerk Production Configuration Guide

## Overview
This guide walks through setting up Clerk for production use with the Pokemon TCG Catalog.

## Steps to Configure Production Instance

### 1. Create Production Application in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Create application"
3. Name it: "Pokemon TCG Catalog - Production"
4. Select authentication methods:
   - ✅ Email
   - ✅ Google OAuth
   - ✅ (Optional) GitHub, Discord

### 2. Configure OAuth Providers

#### Google OAuth Setup:
1. In Clerk Dashboard → Configure → SSO Connections → Google
2. You'll need Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
3. Authorized redirect URIs:
   ```
   https://clerk.YOUR-DOMAIN.com/v1/oauth_callback
   https://YOUR-CLERK-INSTANCE.clerk.accounts.dev/v1/oauth_callback
   ```

### 3. Production Environment Variables

Replace test keys with production keys from Clerk Dashboard → API Keys:

```env
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[your-key]
CLERK_SECRET_KEY=sk_live_[your-key]

# Optional: Custom domain setup
NEXT_PUBLIC_CLERK_DOMAIN=clerk.pokemon-catalog-stable.app

# Production URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 4. Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all production Clerk keys
3. Ensure they're set for Production environment only
4. Keep test keys for Development/Preview environments

### 5. Configure Webhook (Optional but Recommended)

For syncing user data:

1. Clerk Dashboard → Configure → Webhooks
2. Add endpoint: `https://pokemon-catalog-stable.vercel.app/api/clerk-webhook`
3. Select events:
   - user.created
   - user.updated
   - user.deleted
4. Copy signing secret to env:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_[your-secret]
   ```

### 6. Production Security Settings

In Clerk Dashboard → Configure → Security:

1. **Session Settings**:
   - Session lifetime: 7 days
   - Inactivity timeout: 30 minutes

2. **Attack Protection**:
   - Enable bot protection
   - Enable email/IP rate limiting

3. **Allowed Origins** (CORS):
   ```
   https://pokemon-catalog-stable.vercel.app
   https://pokemon-catalog-stable.app (if custom domain)
   ```

### 7. Custom Domain Setup (Optional)

1. Add custom domain in Clerk Dashboard → Configure → Domains
2. Add CNAME record:
   ```
   clerk.pokemon-catalog-stable.app → clerk.YOUR-INSTANCE.lcl.dev
   ```

### 8. Test Production Setup

1. Deploy to production with new keys
2. Test sign up flow
3. Test sign in flow
4. Test OAuth providers
5. Verify session persistence

## Monitoring & Analytics

1. Enable Clerk Analytics in dashboard
2. Monitor:
   - Daily active users
   - Sign up conversion
   - Authentication methods used
   - Failed sign in attempts

## Rollback Plan

If issues occur:
1. Keep test keys backed up
2. Can quickly revert in Vercel env vars
3. Clerk allows multiple API keys

## Next Steps After Configuration

1. Update `.env.local` with production keys (DO NOT COMMIT)
2. Add production keys to Vercel
3. Test authentication flows
4. Enable webhook endpoint
5. Monitor first 24 hours closely