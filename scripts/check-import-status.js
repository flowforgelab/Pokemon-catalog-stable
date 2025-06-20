// Check current import status
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    // Get total cards
    const totalCards = await prisma.card.count();
    
    // Get cards with game data
    const [
      cardsWithAttacks,
      cardsWithAbilities,
      cardsWithWeaknesses,
      cardsWithEvolution,
      pokemonCards,
      trainerCards,
      energyCards
    ] = await Promise.all([
      prisma.card.count({
        where: { attacks: { some: {} } }
      }),
      prisma.card.count({
        where: { abilities: { some: {} } }
      }),
      prisma.card.count({
        where: { weaknesses: { some: {} } }
      }),
      prisma.card.count({
        where: { evolvesFrom: { not: null } }
      }),
      prisma.card.count({
        where: { supertype: 'Pokémon' }
      }),
      prisma.card.count({
        where: { supertype: 'Trainer' }
      }),
      prisma.card.count({
        where: { supertype: 'Energy' }
      })
    ]);

    const progressPercentage = totalCards > 0 
      ? (cardsWithAttacks / pokemonCards) * 100 
      : 0;

    console.log('=== Pokemon TCG Import Status ===\n');
    console.log(`Total Cards: ${totalCards.toLocaleString()}`);
    console.log(`- Pokemon: ${pokemonCards.toLocaleString()}`);
    console.log(`- Trainers: ${trainerCards.toLocaleString()}`);
    console.log(`- Energy: ${energyCards.toLocaleString()}`);
    console.log('\nGame Data Import Progress:');
    console.log(`- Cards with Attacks: ${cardsWithAttacks.toLocaleString()} / ${pokemonCards.toLocaleString()} Pokemon (${progressPercentage.toFixed(1)}%)`);
    console.log(`- Cards with Abilities: ${cardsWithAbilities.toLocaleString()}`);
    console.log(`- Cards with Weaknesses: ${cardsWithWeaknesses.toLocaleString()}`);
    console.log(`- Evolution Chains: ${cardsWithEvolution.toLocaleString()}`);

    // Sample some cards with and without data
    console.log('\nSample Cards WITH Game Data:');
    const withData = await prisma.card.findMany({
      where: { attacks: { some: {} } },
      take: 3,
      include: { attacks: true }
    });
    withData.forEach(card => {
      console.log(`- ${card.name}: ${card.attacks.length} attacks`);
    });

    console.log('\nSample Cards WITHOUT Game Data:');
    const withoutData = await prisma.card.findMany({
      where: { 
        supertype: 'Pokémon',
        attacks: { none: {} } 
      },
      take: 3
    });
    withoutData.forEach(card => {
      console.log(`- ${card.name} (${card.pokemonTcgId})`);
    });

  } catch (error) {
    console.error('Error checking status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();