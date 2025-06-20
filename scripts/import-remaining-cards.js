const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function importRemainingCards() {
  console.log('🚀 Starting import of remaining Pokemon cards to Neon database...\n');
  
  try {
    // First, check current card count
    const currentCount = await prisma.card.count();
    console.log(`📊 Current cards in database: ${currentCount}`);
    
    // Load the exported cards
    const dataPath = path.join(__dirname, 'remaining-cards-export.json');
    console.log(`📂 Loading cards from: ${dataPath}`);
    
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const cards = JSON.parse(fileContent);
    console.log(`📦 Loaded ${cards.length} cards from export file\n`);
    
    // Check for potential duplicates
    console.log('🔍 Checking for duplicates...');
    const existingIds = await prisma.card.findMany({
      select: { pokemonTcgId: true }
    });
    const existingIdSet = new Set(existingIds.map(c => c.pokemonTcgId));
    
    const newCards = cards.filter(card => !existingIdSet.has(card.pokemonTcgId));
    const duplicates = cards.length - newCards.length;
    
    console.log(`✅ Found ${newCards.length} new cards to import`);
    if (duplicates > 0) {
      console.log(`⚠️  Skipping ${duplicates} duplicate cards`);
    }
    console.log('');
    
    // Import in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(newCards.length / batchSize);
    let imported = 0;
    let failed = 0;
    const failedCards = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, newCards.length);
      const batch = newCards.slice(start, end);
      
      process.stdout.write(`\r📤 Importing batch ${i + 1}/${totalBatches} (${imported} imported, ${failed} failed)...`);
      
      try {
        // Use createMany for better performance
        await prisma.card.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        imported += batch.length;
      } catch (error) {
        console.error(`\n❌ Error importing batch ${i + 1}:`, error.message);
        failed += batch.length;
        failedCards.push(...batch.map(c => c.pokemonTcgId));
        
        // Try individual inserts for this batch to identify problem cards
        for (const card of batch) {
          try {
            await prisma.card.create({ data: card });
            imported++;
            failed--; // Correct the count
          } catch (individualError) {
            // Card failed, keep it in failedCards
          }
        }
      }
    }
    
    console.log('\n\n✅ Import complete!');
    
    // Final verification
    const finalCount = await prisma.card.count();
    console.log(`\n📊 Import Summary:`);
    console.log(`   - Cards in database before: ${currentCount}`);
    console.log(`   - Cards in database after: ${finalCount}`);
    console.log(`   - New cards imported: ${finalCount - currentCount}`);
    console.log(`   - Expected new cards: ${newCards.length}`);
    console.log(`   - Failed imports: ${failed}`);
    
    if (failed > 0) {
      console.log(`\n⚠️  Failed card IDs saved to: failed-imports.json`);
      await fs.writeFile(
        path.join(__dirname, 'failed-imports.json'),
        JSON.stringify(failedCards, null, 2)
      );
    }
    
    // Check if we have all expected cards
    const expectedTotal = 18555;
    if (finalCount < expectedTotal) {
      console.log(`\n⚠️  Warning: Database has ${finalCount} cards, expected ${expectedTotal}`);
      console.log(`   Missing: ${expectedTotal - finalCount} cards`);
    } else if (finalCount === expectedTotal) {
      console.log(`\n🎉 Success! All ${expectedTotal} cards are now in the database!`);
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
console.log('📝 This script will import the remaining Pokemon cards to your Neon database.');
console.log('It will skip any duplicates automatically.\n');

importRemainingCards();