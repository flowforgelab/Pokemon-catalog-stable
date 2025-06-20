const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function importFinalCards() {
  console.log('🚀 Importing final cards to reach 100% migration...\n');
  
  try {
    // Check current count
    const currentCount = await prisma.card.count();
    console.log(`📊 Current cards in database: ${currentCount.toLocaleString()}`);
    
    // Load both export files
    const page106Path = path.join(__dirname, 'missing-page-106.json');
    const finalPath = path.join(__dirname, 'final-missing-cards.json');
    
    console.log(`\n📂 Loading export files...`);
    
    const page106Cards = JSON.parse(await fs.readFile(page106Path, 'utf-8'));
    const finalCards = JSON.parse(await fs.readFile(finalPath, 'utf-8'));
    
    const allNewCards = [...page106Cards, ...finalCards];
    console.log(`📦 Loaded ${allNewCards.length} cards total`);
    console.log(`   - Page 106: ${page106Cards.length} cards`);
    console.log(`   - Final missing: ${finalCards.length} cards`);
    
    // Check for duplicates
    console.log('\n🔍 Checking for duplicates...');
    const existingIds = await prisma.card.findMany({
      select: { pokemonTcgId: true }
    });
    const existingIdSet = new Set(existingIds.map(c => c.pokemonTcgId));
    
    const uniqueNewCards = allNewCards.filter(card => !existingIdSet.has(card.pokemonTcgId));
    const duplicates = allNewCards.length - uniqueNewCards.length;
    
    console.log(`✅ Found ${uniqueNewCards.length} unique cards to import`);
    if (duplicates > 0) {
      console.log(`⚠️  Skipping ${duplicates} duplicate cards`);
    }
    
    // Import in batches
    const batchSize = 50;
    const totalBatches = Math.ceil(uniqueNewCards.length / batchSize);
    let imported = 0;
    
    console.log(`\n📤 Importing in ${totalBatches} batches...`);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, uniqueNewCards.length);
      const batch = uniqueNewCards.slice(start, end);
      
      process.stdout.write(`\r📤 Importing batch ${i + 1}/${totalBatches} (${imported} imported)...`);
      
      try {
        await prisma.card.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        imported += batch.length;
      } catch (error) {
        console.error(`\n❌ Error importing batch ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n\n✅ Import complete!');
    
    // Final verification
    const finalCount = await prisma.card.count();
    const expectedTotal = 18555;
    
    console.log(`\n📊 Final Migration Summary:`);
    console.log(`   - Cards before import: ${currentCount.toLocaleString()}`);
    console.log(`   - Cards after import: ${finalCount.toLocaleString()}`);
    console.log(`   - New cards imported: ${finalCount - currentCount}`);
    console.log(`   - Expected total: ${expectedTotal.toLocaleString()}`);
    console.log(`   - Migration completion: ${((finalCount / expectedTotal) * 100).toFixed(1)}%`);
    
    if (finalCount >= expectedTotal) {
      console.log(`\n🎉 SUCCESS! 100% of cards have been migrated!`);
    } else {
      const remaining = expectedTotal - finalCount;
      console.log(`\n⚠️  Still missing ${remaining} cards (${((remaining / expectedTotal) * 100).toFixed(1)}%)`);
    }
    
    // Show final statistics
    const stats = await prisma.card.groupBy({
      by: ['supertype'],
      _count: true
    });
    
    console.log(`\n📋 Final card distribution:`);
    stats.forEach(stat => {
      console.log(`   - ${stat.supertype}: ${stat._count.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
console.log('📝 This script imports the final missing cards to complete the migration.');

importFinalCards();