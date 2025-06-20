# Game Data Import Instructions

The game data import fetches detailed Pokemon TCG data (attacks, abilities, weaknesses, etc.) from the official Pokemon TCG API for all 18,405 cards in the database.

## Quick Start

To run the import in the background:

```bash
# Start the import (runs in background, saves progress)
nohup node scripts/import-game-data-resume.js > import.log 2>&1 &

# Check the process ID
ps aux | grep import-game-data

# Monitor progress in real-time
tail -f import.log

# Check overall status
node scripts/check-import-status.js
```

## Import Details

- **Total Cards**: 18,405 (15,602 Pokemon, 2,443 Trainers, 351 Energy)
- **Estimated Time**: 3-5 hours (processes ~100 cards/minute with rate limiting)
- **Current Progress**: 232/15,602 Pokemon cards (1.5%)

## Features

The resumable import script (`import-game-data-resume.js`):
- Saves progress every 10 cards
- Can be stopped and resumed anytime
- Handles API rate limits (100ms delay between requests)
- Skips cards that don't exist in the Pokemon TCG API
- Shows estimated time remaining

## Progress Tracking

1. **Via Terminal**:
   ```bash
   node scripts/check-import-status.js
   ```

2. **Via Web UI**:
   Visit http://localhost:3000/import-status to see live progress

3. **Via Log File**:
   ```bash
   tail -f import.log
   ```

## Troubleshooting

If the import stops:
1. Check if the process is still running: `ps aux | grep import`
2. Simply run the script again - it will resume from where it left off
3. Progress is saved in `scripts/import-progress.json`

## What Gets Imported

For each Pokemon card:
- Attack data (name, cost, damage, effects)
- Abilities (name, type, text)
- Weaknesses and resistances
- Evolution information
- Retreat costs
- Tournament legality
- Rules text and flavor text

## Next Steps

Once the import completes (100% of Pokemon cards have attack data):
1. The AI deck analysis features will be fully functional
2. Cards will display complete game mechanics in the UI
3. Deck building will show energy curves and type distributions
4. Search will support filtering by attacks, abilities, etc.