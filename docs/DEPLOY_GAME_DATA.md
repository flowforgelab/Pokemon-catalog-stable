# Deploying Game Data to Vercel Production

## Option 1: Run Import Directly on Vercel (Recommended)

The simplest approach is to run the import script directly against your Vercel Postgres database:

### Steps:
1. **Add API Key to Vercel**
   - Go to your Vercel project settings
   - Add `POKEMON_TCG_API_KEY` environment variable
   - Redeploy to pick up the new variable

2. **Create Import API Route**
   ```typescript
   // src/app/api/admin/import-game-data/route.ts
   import { importDailyBatch } from '@/scripts/import-game-data-daily';
   
   export async function POST(request: Request) {
     // Add authentication here
     const result = await importDailyBatch();
     return Response.json(result);
   }
   ```

3. **Use Vercel Cron Jobs**
   ```json
   // vercel.json
   {
     "crons": [{
       "path": "/api/admin/import-game-data",
       "schedule": "0 2 * * *"
     }]
   }
   ```

## Option 2: Export/Import Database

If you want to transfer your local data to production:

### Export from Local:
```bash
# Export just the game data tables
pg_dump -h localhost -U postgres -d pokemon_catalog \
  --table='"Attack"' \
  --table='"Ability"' \
  --table='"Weakness"' \
  --table='"Resistance"' \
  --data-only \
  > game_data_export.sql
```

### Import to Vercel:
```bash
# Get connection string from Vercel dashboard
psql "postgresql://user:pass@host/db?sslmode=require" < game_data_export.sql
```

## Option 3: Sync Script

Create a script that reads from local and writes to production:

```javascript
// scripts/sync-to-production.js
const localPrisma = new PrismaClient({ 
  datasources: { db: { url: process.env.LOCAL_DATABASE_URL } }
});

const prodPrisma = new PrismaClient({ 
  datasources: { db: { url: process.env.VERCEL_DATABASE_URL } }
});

// Sync attacks, abilities, etc.
```

## Option 4: GitHub Actions

Automate the daily import with GitHub Actions:

```yaml
# .github/workflows/daily-import.yml
name: Daily Game Data Import
on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run import:daily
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          POKEMON_TCG_API_KEY: ${{ secrets.POKEMON_TCG_API_KEY }}
```

## Recommendation

**Use Option 1** - Run the import directly on Vercel:
- No data transfer needed
- Automatic daily updates
- Uses Vercel's cron jobs (free tier: 2 cron jobs)
- Data stays in production

The import script is already designed to be resumable and track progress, so it will work perfectly in a serverless environment.