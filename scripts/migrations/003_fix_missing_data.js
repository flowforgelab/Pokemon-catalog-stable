const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * Fix missing data migration
 * Cleans up and fixes any data quality issues
 */
async function migrate() {
  console.log('🔧 Running data cleanup migration...\n');
  
  try {
    // 1. Fix cards with missing images
    console.log('Fixing missing images...');
    const cardsWithoutImages = await prisma.card.findMany({
      where: {
        OR: [
          { imageSmall: '' },
          { imageSmall: null },
          { imageLarge: '' },
          { imageLarge: null }
        ]
      }
    });
    
    console.log(`Found ${cardsWithoutImages.length} cards with missing images`);
    
    for (const card of cardsWithoutImages) {
      const placeholder = `https://images.pokemontcg.io/placeholder.png`;
      await prisma.card.update({
        where: { id: card.id },
        data: {
          imageSmall: card.imageSmall || placeholder,
          imageLarge: card.imageLarge || card.imageSmall || placeholder
        }
      });
    }
    
    // 2. Fix empty arrays stored as strings
    console.log('\nFixing data types...');
    const cardsWithStringArrays = await prisma.card.findMany({
      where: {
        types: { equals: [] }
      }
    });
    
    console.log(`Found ${cardsWithStringArrays.length} cards with empty type arrays`);
    
    // 3. Normalize set names
    console.log('\nNormalizing set names...');
    const sets = await prisma.card.groupBy({
      by: ['setName'],
      _count: true
    });
    
    console.log(`Found ${sets.length} unique sets`);
    
    // 4. Fix cards with missing HP (only for Pokemon cards)
    console.log('\nFixing missing HP values...');
    const pokemonWithoutHP = await prisma.card.findMany({
      where: {
        AND: [
          { supertype: 'Pokémon' },
          { OR: [{ hp: null }, { hp: '' }, { hp: '0' }] }
        ]
      }
    });
    
    console.log(`Found ${pokemonWithoutHP.length} Pokemon cards without HP`);
    
    // Set default HP based on card attributes
    for (const card of pokemonWithoutHP) {
      let defaultHP = '50'; // Base default
      
      if (card.name.includes('VMAX')) defaultHP = '320';
      else if (card.name.includes('VSTAR')) defaultHP = '280';
      else if (card.name.includes('V')) defaultHP = '220';
      else if (card.name.includes('GX')) defaultHP = '200';
      else if (card.name.includes('EX')) defaultHP = '180';
      
      await prisma.card.update({
        where: { id: card.id },
        data: { hp: defaultHP }
      });
    }
    
    // 5. Summary report
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Fixed ${cardsWithoutImages.length} cards with missing images`);
    console.log(`✅ Normalized ${sets.length} set names`);
    console.log(`✅ Fixed ${pokemonWithoutHP.length} Pokemon cards without HP`);
    
    // Final data quality check
    const finalStats = await prisma.card.aggregate({
      _count: true
    });
    
    const withImages = await prisma.card.count({
      where: {
        AND: [
          { imageSmall: { not: null } },
          { imageSmall: { not: '' } }
        ]
      }
    });
    
    const withPrices = await prisma.card.count({
      where: { marketPrice: { not: null } }
    });
    
    console.log('\n📈 Data Quality Metrics:');
    console.log(`   Total cards: ${finalStats._count}`);
    console.log(`   Cards with images: ${withImages} (${((withImages / finalStats._count) * 100).toFixed(1)}%)`);
    console.log(`   Cards with prices: ${withPrices} (${((withPrices / finalStats._count) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate().catch(console.error);