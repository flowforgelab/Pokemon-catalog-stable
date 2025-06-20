// Test import with just a few cards to verify everything works
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImport() {
  console.log('Testing game data import with 5 cards...\n');
  
  try {
    // Get 5 cards to test
    const testCards = await prisma.card.findMany({
      take: 5,
      orderBy: { createdAt: 'asc' }
    });

    console.log('Test cards:');
    testCards.forEach(card => {
      console.log(`- ${card.name} (${card.pokemonTcgId})`);
    });

    // Check if we already have game data
    const firstCard = await prisma.card.findUnique({
      where: { id: testCards[0].id },
      include: {
        attacks: true,
        abilities: true,
        weaknesses: true,
        resistances: true,
      }
    });

    console.log('\nFirst card current state:');
    console.log(`- Attacks: ${firstCard.attacks.length}`);
    console.log(`- Abilities: ${firstCard.abilities.length}`);
    console.log(`- Weaknesses: ${firstCard.weaknesses.length}`);
    console.log(`- Resistances: ${firstCard.resistances.length}`);
    console.log(`- Evolution: ${firstCard.evolvesFrom || 'None'}`);
    console.log(`- Retreat Cost: ${firstCard.retreatCost || 'None'}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImport();