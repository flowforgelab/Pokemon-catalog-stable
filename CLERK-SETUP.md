# Clerk Authentication Setup

## 1. Clerk Dashboard Setup

### For Testing (Using Test Keys)
The app is currently configured with Clerk test keys that should work immediately:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2VudHJhbC1iZW5nYWwtMTYuY2xlcmsuYWNjb3VudHMuZGV2JA`
- `CLERK_SECRET_KEY=sk_test_DdQK7vp4wt2FzpjQeNh0YCew8GknCRxUPhzvcIWDOl`

### For Production (Your Own Clerk Account)
1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Choose "Google" as a social connection
4. Get your API keys from the dashboard

## 2. Configure OAuth Redirect URLs

In Clerk Dashboard → Configure → Social Connections → Google:

Add these redirect URLs:
```
https://pokemon-catalog-stable.vercel.app
http://localhost:3000
http://localhost:3001
```

## 3. Update Vercel Environment Variables

In your Vercel project settings, add/update:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# App URL
NEXT_PUBLIC_APP_URL=https://pokemon-catalog-stable.vercel.app
```

## 4. Test Authentication Flow

1. Visit https://pokemon-catalog-stable.vercel.app
2. Click "Sign In"
3. Try Google OAuth
4. You should be redirected back and logged in
5. Visit /dashboard (protected route)

## 5. Troubleshooting

### "Unauthorized" Error
- Check that both Clerk keys are set in Vercel
- Ensure the keys match (test vs production)
- Redeploy after adding environment variables

### Redirect Issues
- Verify redirect URLs in Clerk dashboard
- Check NEXT_PUBLIC_APP_URL is set correctly
- Clear cookies and try again

### Google OAuth Not Working
- Enable Google in Clerk dashboard
- For production: Set up Google OAuth app
- Add your domain to authorized domains

## Current Status

Using test keys for initial setup. These work for:
- Local development
- Initial testing
- Up to 500 users

For production, you'll need to:
1. Create your own Clerk account
2. Set up your own Google OAuth
3. Update environment variables