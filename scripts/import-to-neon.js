const { PrismaClient } = require('../node_modules/@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function importCards() {
  console.log('🚀 Starting import to Neon database...');
  
  try {
    // Load the exported data
    const dataPath = path.join(__dirname, 'export-progress.json');
    console.log('📁 Loading data from:', dataPath);
    
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const cards = JSON.parse(rawData);
    
    console.log(`📊 Found ${cards.length} cards to import`);
    
    // Transform to match our schema
    const transformedCards = cards.map(card => ({
      pokemonTcgId: card.id,
      name: card.name || 'Unknown',
      supertype: card.supertype || 'Unknown',
      subtypes: [], // API doesn't provide this
      types: card.types || [],
      hp: card.hp || null,
      number: card.number || '',
      artist: card.artist || '',
      rarity: card.rarity || '',
      setId: '', // API doesn't provide this
      setName: card.setName || '',
      setSeries: card.setSeries || '',
      setTotal: 0, // API doesn't provide this
      imageSmall: card.imageSmall || '',
      imageLarge: card.imageLarge || card.imageSmall || '',
      marketPrice: card.marketPrice || null,
      tcgplayerUrl: card.tcgplayerUrl || null
    }));
    
    // Import in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(transformedCards.length / batchSize);
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < totalBatches; i++) {
      const batch = transformedCards.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        process.stdout.write(`\r⏳ Importing batch ${i + 1}/${totalBatches} (${imported} imported, ${failed} failed)...`);
        
        // Use createMany with skipDuplicates
        const result = await prisma.card.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        imported += result.count;
        
      } catch (error) {
        console.error(`\n❌ Batch ${i + 1} failed:`, error.message);
        failed += batch.length;
      }
    }
    
    console.log('\n\n✅ Import complete!');
    console.log(`📊 Import summary:`);
    console.log(`   - Total cards processed: ${transformedCards.length}`);
    console.log(`   - Successfully imported: ${imported}`);
    console.log(`   - Failed/Skipped: ${failed}`);
    
    // Verify final count
    const finalCount = await prisma.card.count();
    console.log(`   - Total cards in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importCards();