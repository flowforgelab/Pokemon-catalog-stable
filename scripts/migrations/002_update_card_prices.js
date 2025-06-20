const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * Update card prices migration
 * This script can be run periodically to update market prices
 */
async function migrate() {
  console.log('💰 Running card price update migration...\n');
  
  try {
    // Get cards that need price updates (no price or old prices)
    const cardsNeedingUpdate = await prisma.card.findMany({
      where: {
        OR: [
          { marketPrice: null },
          { updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Older than 7 days
        ]
      },
      take: 100 // Batch size
    });
    
    console.log(`Found ${cardsNeedingUpdate.length} cards needing price updates`);
    
    // In production, this would call a price API
    // For now, we'll simulate with placeholder logic
    let updated = 0;
    
    for (const card of cardsNeedingUpdate) {
      // Simulate price calculation based on rarity
      let basePrice = 0.50;
      
      switch (card.rarity) {
        case 'Rare Secret':
        case 'Rare Rainbow':
          basePrice = Math.random() * 100 + 50; // $50-150
          break;
        case 'Rare Ultra':
        case 'Rare Holo VMAX':
        case 'Rare Holo VSTAR':
          basePrice = Math.random() * 50 + 20; // $20-70
          break;
        case 'Rare Holo':
        case 'Rare Holo V':
          basePrice = Math.random() * 20 + 5; // $5-25
          break;
        case 'Rare':
          basePrice = Math.random() * 5 + 1; // $1-6
          break;
        case 'Uncommon':
          basePrice = Math.random() * 2 + 0.25; // $0.25-2.25
          break;
        case 'Common':
          basePrice = Math.random() * 0.5 + 0.10; // $0.10-0.60
          break;
      }
      
      // Update the card price
      await prisma.card.update({
        where: { id: card.id },
        data: { 
          marketPrice: parseFloat(basePrice.toFixed(2)),
          updatedAt: new Date()
        }
      });
      
      updated++;
      
      if (updated % 10 === 0) {
        process.stdout.write(`\rUpdated ${updated}/${cardsNeedingUpdate.length} cards...`);
      }
    }
    
    console.log(`\n\n✅ Updated prices for ${updated} cards`);
    
    // Summary statistics
    const priceStats = await prisma.card.aggregate({
      _avg: { marketPrice: true },
      _min: { marketPrice: true },
      _max: { marketPrice: true },
      _count: { marketPrice: true }
    });
    
    console.log('\n📊 Price Statistics:');
    console.log(`   Average: $${priceStats._avg.marketPrice?.toFixed(2) || 'N/A'}`);
    console.log(`   Min: $${priceStats._min.marketPrice?.toFixed(2) || 'N/A'}`);
    console.log(`   Max: $${priceStats._max.marketPrice?.toFixed(2) || 'N/A'}`);
    console.log(`   Cards with prices: ${priceStats._count.marketPrice}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate().catch(console.error);