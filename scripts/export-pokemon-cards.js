const { PrismaClient } = require('../node_modules/@prisma/client');
const fs = require('fs').promises;
const path = require('path');

// Production Supabase connection
const productionDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:tesfa5-peHbuv-sojnuz@db.zgzvwrhoprhdvdnwofiq.supabase.co:6543/postgres?pgbouncer=true'
    }
  }
});

async function exportCards() {
  console.log('🔍 Connecting to production Supabase database...');
  
  try {
    await productionDb.$connect();
    console.log('✅ Connected to production database');
    
    // Count cards
    const count = await productionDb.card.count();
    console.log(`📊 Found ${count} cards to export`);
    
    // Export in batches to avoid memory issues
    const batchSize = 1000;
    const totalBatches = Math.ceil(count / batchSize);
    let allCards = [];
    
    for (let i = 0; i < totalBatches; i++) {
      console.log(`📦 Exporting batch ${i + 1}/${totalBatches}...`);
      
      const cards = await productionDb.card.findMany({
        skip: i * batchSize,
        take: batchSize,
        orderBy: { id: 'asc' }
      });
      
      allCards = allCards.concat(cards);
    }
    
    // Save to JSON file
    const exportPath = path.join(__dirname, 'pokemon-cards-export.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(allCards, null, 2)
    );
    
    console.log(`✅ Exported ${allCards.length} cards to ${exportPath}`);
    
    // Show sample card structure
    if (allCards.length > 0) {
      console.log('\n📋 Sample card structure:');
      console.log(JSON.stringify(allCards[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error);
  } finally {
    await productionDb.$disconnect();
  }
}

// Run export
exportCards();