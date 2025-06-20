# Deployment Guide

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/pokemon-catalog-stable.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your `pokemon-catalog-stable` repository
4. Add these environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2VudHJhbC1iZW5nYWwtMTYuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_DdQK7vp4wt2FzpjQeNh0YCew8GknCRxUPhzvcIWDOl
   ```
5. Click "Deploy"

### 3. Add Vercel Postgres

After deployment:
1. Go to your Vercel project dashboard
2. Click "Storage" → "Create Database"
3. Choose "Postgres"
4. Connect to your project
5. Copy all the database environment variables

### 4. Set Up Database

Once Postgres is connected:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma db push
```

### 5. Configure Clerk for Production

1. Go to [clerk.com](https://clerk.com)
2. Create a production instance
3. Add your production domain to allowed origins
4. Update environment variables in Vercel with production keys

## Post-Deployment

Your app will be available at:
- `https://pokemon-catalog-stable.vercel.app` (or your custom domain)

Features ready to use:
- ✅ User authentication with Google
- ✅ Protected dashboard
- ✅ Pokemon cards browsing
- ✅ Database schema for collections/decks

## Next Development Steps

1. **Import Pokemon Data**: Create a script to import cards from Pokemon TCG API
2. **Add Search**: Implement card search and filtering
3. **Collection Features**: Allow users to add cards to collections
4. **Deck Builder**: Implement deck creation and validation