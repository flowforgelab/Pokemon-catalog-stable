# Data Migration Scripts

This directory contains scripts for managing data migrations and updates in the Pokemon TCG Catalog.

## Available Migrations

### 001_initial_seed.js
- Creates default data structures
- Verifies data integrity
- Documents rarities and types
- Run once after initial setup

### 002_update_card_prices.js
- Updates market prices for cards
- Can be run periodically (daily/weekly)
- Simulates price data (replace with real API in production)
- Updates cards older than 7 days

### 003_fix_missing_data.js
- Fixes data quality issues
- Adds placeholder images for missing cards
- Normalizes HP values for Pokemon
- Cleans up data types
- Run as needed for data cleanup

## Running Migrations

### Single Migration
```bash
node scripts/migrations/001_initial_seed.js
```

### All Migrations in Order
```bash
npm run migrate
```

### Specific Migration
```bash
npm run migrate -- --only=002
```

## Creating New Migrations

1. Create a new file with naming pattern: `XXX_description.js`
2. Use incrementing numbers (004, 005, etc.)
3. Include clear console output
4. Always handle errors gracefully
5. Disconnect from database when done

## Migration Template

```javascript
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Running YOUR_MIGRATION_NAME...\n');
  
  try {
    // Your migration logic here
    
    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate().catch(console.error);
```

## Best Practices

1. **Idempotent**: Migrations should be safe to run multiple times
2. **Logging**: Clear output showing progress
3. **Error Handling**: Graceful failures with helpful messages
4. **Performance**: Use batch operations for large datasets
5. **Testing**: Test on development data first

## Production Considerations

- Always backup database before running migrations
- Run during low-traffic periods
- Monitor performance impact
- Have rollback plan ready
- Document any manual steps required