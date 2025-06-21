# Game Data Import Guide

## Problem
The Pokemon TCG database has 18,405 cards, but only 18.1% (3,329 cards) have game mechanics data (attacks, abilities, weaknesses, etc.). This limits the effectiveness of the AI deck analyzer.

## Root Cause
The import has been running without a Pokemon TCG API key, which severely limits the rate:
- **Without API key**: 20 requests per 5 seconds = 63+ hours for 15k cards
- **With API key**: 1,000 requests per day = 15 days for all cards

## Solution

### Step 1: Get a Free API Key (Recommended)
1. Visit https://dev.pokemontcg.io/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`:
   ```
   POKEMON_TCG_API_KEY=your-key-here
   ```

### Step 2: Run the Smart Import Script
```bash
cd pokemon-catalog-stable
node scripts/import-game-data-smart.js
```

The script will:
- Automatically detect if you have an API key
- Adapt rate limiting based on your setup
- Save progress so you can resume if interrupted
- Focus on Pokemon cards first (most important for deck analysis)
- Show detailed progress and time estimates

### Step 3: Monitor Progress
The import status page shows real-time progress:
- Visit http://localhost:3000/import-status
- Or check https://pokemon-catalog-stable.vercel.app/import-status

## Import Scripts

### `import-game-data-smart.js` (Recommended)
- Adapts to API key presence
- Saves progress automatically
- Handles rate limits gracefully
- Shows time estimates

### `import-game-data-optimized.js`
- More aggressive importing
- Better for API key users
- Includes retry logic

### `retry-failed-imports.js`
- Diagnostic tool
- Tests API rate limits
- Shows current status

## API Key Required

**UPDATE (Dec 2025)**: The Pokemon TCG API now REQUIRES an API key for all requests. Without a key, you'll get HTTP 429 (rate limited) on every request.

You MUST:
1. Get a free API key from https://dev.pokemontcg.io/
2. Add it to `.env.local`
3. Add it to Vercel environment variables

## Checking Progress
```bash
# See overall game data coverage
node scripts/retry-failed-imports.js

# Check import logs
tail -f import.log
```

## Troubleshooting

### Rate Limit Errors (429)
- Normal without API key
- Script handles automatically
- Just let it run

### No Data Found
- Some cards don't have game data in the API
- Trainer and Energy cards often have minimal data
- This is expected

### Import Seems Stuck
- Check if you hit daily limit (with API key)
- Without key, it's just slow (working as designed)
- Progress is saved, safe to restart