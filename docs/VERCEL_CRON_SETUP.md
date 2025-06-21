# Vercel Cron Job Setup for Game Data Import

## Overview

This guide helps you set up automated daily imports of Pokemon TCG game data in Vercel using cron jobs.

## Setup Steps

### 1. Add Environment Variables to Vercel

Go to your Vercel project settings and add these environment variables:

```bash
# Your separate Pokemon TCG API key for Vercel
POKEMON_TCG_API_KEY=your-vercel-api-key-here

# Admin user ID (your Clerk user ID)
ADMIN_USER_ID=your-clerk-user-id

# Cron secret for additional security
CRON_SECRET=generate-a-random-secret-here
```

**Important**: Use a different API key than your local one to avoid rate limit conflicts.

### 2. Cron Job Configuration

The `vercel.json` file has been updated with:

```json
{
  "crons": [
    {
      "path": "/api/admin/import-game-data",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs the import daily at 2:00 AM UTC.

### 3. Cron Schedule Options

- `"0 2 * * *"` - Daily at 2:00 AM UTC
- `"0 */6 * * *"` - Every 6 hours
- `"0 0 * * 0"` - Weekly on Sunday at midnight
- `"0 0 1 * *"` - Monthly on the 1st

### 4. Security

The API endpoint (`/api/admin/import-game-data/route.ts`) has two authentication methods:

1. **Clerk Authentication**: For manual runs by admin users
2. **Cron Secret**: For automated Vercel cron jobs

Vercel automatically adds the `x-cron-secret` header to cron requests.

### 5. Monitoring

Check import progress:
- Visit `/api/admin/import-game-data` (GET) to see current status
- View Vercel function logs for detailed import info
- Check your database for updated card counts

### 6. Testing

To test the cron job manually:

```bash
# From your local machine (requires admin auth)
curl -X POST https://your-app.vercel.app/api/admin/import-game-data \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Or use the import status page
https://your-app.vercel.app/import-status
```

## Important Notes

1. **Rate Limits**: Each API key has a 1000 requests/day limit
2. **Batch Size**: The endpoint processes 1000 cards per run (full daily API limit)
3. **Progress**: With ~12,000 Pokemon cards needing data, expect ~12 days for full import
4. **Resumable**: The import tracks progress and resumes where it left off

## Troubleshooting

### Cron job not running?
- Check Vercel dashboard > Functions > Cron Jobs
- Verify environment variables are set
- Check function logs for errors

### Import failing?
- Verify API key is valid and has remaining quota
- Check Vercel function timeout (default 10s, may need increase)
- Review error logs in Vercel dashboard

### Rate limit issues?
- Use separate API keys for local and production
- Reduce batch size if needed
- Consider running at different times to spread load