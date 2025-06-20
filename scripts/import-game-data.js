// Full import script to update all cards with game data from Pokemon TCG API
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
const BATCH_SIZE = 50; // Process in batches to avoid memory issues
const DELAY_MS = 100; // Delay between API calls to respect rate limits

// Helper to delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCardData(pokemonTcgId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${pokemonTcgId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${pokemonTcgId}:`, error.message);
    return null;
  }
}

async function updateCardWithGameData(card, apiData) {
  try {
    // Update the card with game data
    const updatedCard = await prisma.card.update({
      where: { id: card.id },
      data: {
        evolvesFrom: apiData.evolvesFrom || null,
        evolvesTo: apiData.evolvesTo || [],
        retreatCost: apiData.convertedRetreatCost || 0,
        regulationMark: apiData.regulationMark || null,
        rules: apiData.rules || [],
        flavorText: apiData.flavorText || null,
        standardLegal: apiData.legalities?.standard === 'Legal',
        expandedLegal: apiData.legalities?.expanded === 'Legal',
        unlimitedLegal: apiData.legalities?.unlimited === 'Legal',
      }
    });

    // Delete existing related data to avoid duplicates
    await prisma.attack.deleteMany({ where: { cardId: card.id } });
    await prisma.ability.deleteMany({ where: { cardId: card.id } });
    await prisma.weakness.deleteMany({ where: { cardId: card.id } });
    await prisma.resistance.deleteMany({ where: { cardId: card.id } });

    // Add attacks
    if (apiData.attacks && apiData.attacks.length > 0) {
      await prisma.attack.createMany({
        data: apiData.attacks.map(attack => ({
          cardId: card.id,
          name: attack.name,
          cost: attack.cost || [],
          damage: attack.damage || null,
          text: attack.text || null,
          convertedEnergyCost: attack.convertedEnergyCost || 0,
        }))
      });
    }

    // Add abilities
    if (apiData.abilities && apiData.abilities.length > 0) {
      await prisma.ability.createMany({
        data: apiData.abilities.map(ability => ({
          cardId: card.id,
          name: ability.name,
          type: ability.type || 'Ability',
          text: ability.text || '',
        }))
      });
    }

    // Add weaknesses
    if (apiData.weaknesses && apiData.weaknesses.length > 0) {
      await prisma.weakness.createMany({
        data: apiData.weaknesses.map(weakness => ({
          cardId: card.id,
          type: weakness.type,
          value: weakness.value,
        }))
      });
    }

    // Add resistances
    if (apiData.resistances && apiData.resistances.length > 0) {
      await prisma.resistance.createMany({
        data: apiData.resistances.map(resistance => ({
          cardId: card.id,
          type: resistance.type,
          value: resistance.value,
        }))
      });
    }

    return updatedCard;
  } catch (error) {
    console.error(`Error updating card ${card.pokemonTcgId}:`, error.message);
    return null;
  }
}

async function importGameData() {
  console.log('Starting game data import...');
  
  try {
    // Get total count of cards
    const totalCards = await prisma.card.count();
    console.log(`Found ${totalCards} cards to update`);

    let processed = 0;
    let updated = 0;
    let failed = 0;

    // Process cards in batches
    for (let offset = 0; offset < totalCards; offset += BATCH_SIZE) {
      const cards = await prisma.card.findMany({
        skip: offset,
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' }
      });

      console.log(`\nProcessing batch ${Math.floor(offset / BATCH_SIZE) + 1} (${cards.length} cards)`);

      for (const card of cards) {
        processed++;
        
        // Show progress
        if (processed % 10 === 0) {
          const progress = ((processed / totalCards) * 100).toFixed(1);
          console.log(`Progress: ${processed}/${totalCards} (${progress}%)`);
        }

        // Fetch data from Pokemon TCG API
        const apiData = await fetchCardData(card.pokemonTcgId);
        
        if (apiData) {
          const result = await updateCardWithGameData(card, apiData);
          if (result) {
            updated++;
          } else {
            failed++;
          }
        } else {
          console.log(`No API data found for ${card.pokemonTcgId}`);
          failed++;
        }

        // Delay between API calls
        await delay(DELAY_MS);
      }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((updated / processed) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add progress tracking for long-running import
process.on('SIGINT', async () => {
  console.log('\nImport interrupted. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the import
importGameData();