# Vercel Deployment Guide

## 1. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import from Git:
   - Select "GitHub"
   - Choose `flowforgelab/Pokemon-catalog-stable`
   - Click "Import"

## 2. Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## 3. Environment Variables

Add these environment variables in Vercel dashboard:

### Clerk Authentication (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2VudHJhbC1iZW5nYWwtMTYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_DdQK7vp4wt2FzpjQeNh0YCew8GknCRxUPhzvcIWDOl
```

### Application URL (Required)
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Note**: Update `NEXT_PUBLIC_APP_URL` after deployment with your actual Vercel URL.

### Database (Will be added after Vercel Postgres setup)
Leave these empty for now - Vercel will auto-populate when you add Postgres:
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NO_SSL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

## 4. Deploy

Click "Deploy" and wait for the build to complete.

## 5. Post-Deployment Steps

### Update Environment Variables
1. Copy your deployment URL (e.g., `https://pokemon-catalog-stable.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your deployment URL
4. Redeploy to apply changes

### Add Vercel Postgres
1. Go to your project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Choose "Postgres"
5. Select your region (choose closest to your users)
6. Click "Create"

Vercel will automatically:
- Create the database
- Add all required environment variables
- Make them available to your app

### Initialize Database Schema
After Postgres is connected:

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Pull environment variables locally:
```bash
vercel env pull .env.local
```

3. Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

## 6. Verify Deployment

1. Visit your deployment URL
2. Click "Sign In"
3. Try Google OAuth login
4. Verify you can access the dashboard

## 7. Configure Clerk for Production

Currently using test keys. For production:
1. Go to [clerk.com](https://clerk.com)
2. Create a production instance
3. Add your Vercel domain to allowed origins
4. Update environment variables in Vercel with production keys

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Auth Not Working
- Verify Clerk keys are correct
- Check that `NEXT_PUBLIC_APP_URL` matches your deployment URL
- Ensure cookies are enabled in browser

### Database Connection Issues
- Verify all Postgres env vars are set
- Check that Prisma schema has been pushed
- Look at Function logs in Vercel dashboard

## Next Steps

After successful deployment:
1. ✅ Update MIGRATION.md with deployment URL
2. ✅ Test authentication flow
3. ✅ Proceed with data import from production database