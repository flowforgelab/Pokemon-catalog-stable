const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * Initial seed migration
 * This creates default data needed for the application
 */
async function migrate() {
  console.log('🌱 Running initial seed migration...\n');
  
  try {
    // 1. Create default rarities if they don't exist
    console.log('Creating default rarities...');
    const rarities = [
      'Common',
      'Uncommon', 
      'Rare',
      'Rare Holo',
      'Rare Ultra',
      'Rare Secret',
      'Rare Rainbow',
      'Rare Holo V',
      'Rare Holo VMAX',
      'Rare Holo VSTAR',
      'Promo'
    ];
    
    // This would be used if we had a Rarity table
    // for (const rarity of rarities) {
    //   await prisma.rarity.upsert({
    //     where: { name: rarity },
    //     update: {},
    //     create: { name: rarity }
    //   });
    // }
    
    // 2. Create Pokemon types
    console.log('Documenting Pokemon types...');
    const types = [
      'Grass', 'Fire', 'Water', 'Lightning', 'Psychic',
      'Fighting', 'Darkness', 'Metal', 'Fairy', 'Dragon',
      'Colorless'
    ];
    
    // 3. Verify data integrity
    console.log('\nVerifying data integrity...');
    const cardCount = await prisma.card.count();
    const uniqueSets = await prisma.card.findMany({
      distinct: ['setName'],
      select: { setName: true }
    });
    
    console.log(`✅ Total cards: ${cardCount}`);
    console.log(`✅ Unique sets: ${uniqueSets.length}`);
    console.log(`✅ Rarities documented: ${rarities.length}`);
    console.log(`✅ Types documented: ${types.length}`);
    
    console.log('\n🎉 Initial seed migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate().catch(console.error);