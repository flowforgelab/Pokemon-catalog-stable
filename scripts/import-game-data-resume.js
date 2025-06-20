// Resumable import script that tracks progress and can continue from where it left off
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
const BATCH_SIZE = 50;
const DELAY_MS = 100;
const PROGRESS_FILE = path.join(__dirname, 'import-progress.json');

// Helper to delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load progress from file
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      lastProcessedIndex: 0,
      totalProcessed: 0,
      successCount: 0,
      failCount: 0,
      startTime: new Date().toISOString()
    };
  }
}

// Save progress to file
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function fetchCardData(pokemonTcgId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Card not found in API: ${pokemonTcgId}`);
      } else {
        console.error(`Failed to fetch ${pokemonTcgId}: ${response.status}`);
      }
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
  console.log('Starting resumable game data import...');
  
  try {
    // Load previous progress
    const progress = await loadProgress();
    console.log('Loading progress:', progress);

    // Get total count of cards
    const totalCards = await prisma.card.count();
    console.log(`Found ${totalCards} cards to update`);

    if (progress.lastProcessedIndex > 0) {
      console.log(`Resuming from card ${progress.lastProcessedIndex + 1}...`);
    }

    let processed = progress.totalProcessed;
    let updated = progress.successCount;
    let failed = progress.failCount;

    // Process cards in batches, starting from last processed index
    for (let offset = progress.lastProcessedIndex; offset < totalCards; offset += BATCH_SIZE) {
      const cards = await prisma.card.findMany({
        skip: offset,
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' }
      });

      console.log(`\nProcessing batch ${Math.floor(offset / BATCH_SIZE) + 1} (${cards.length} cards)`);

      for (const card of cards) {
        processed++;
        
        // Show progress every 10 cards and save state
        if (processed % 10 === 0) {
          const progressPercent = ((processed / totalCards) * 100).toFixed(1);
          const elapsed = Date.now() - new Date(progress.startTime).getTime();
          const rate = processed / (elapsed / 1000 / 60); // cards per minute
          const remaining = (totalCards - processed) / rate; // minutes remaining
          
          console.log(`Progress: ${processed}/${totalCards} (${progressPercent}%) - ${rate.toFixed(0)} cards/min - ~${remaining.toFixed(0)} min remaining`);
          
          // Save progress
          await saveProgress({
            lastProcessedIndex: offset + cards.indexOf(card),
            totalProcessed: processed,
            successCount: updated,
            failCount: failed,
            startTime: progress.startTime
          });
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
          failed++;
        }

        // Delay between API calls
        await delay(DELAY_MS);
      }
    }

    // Final save
    await saveProgress({
      lastProcessedIndex: totalCards,
      totalProcessed: processed,
      successCount: updated,
      failCount: failed,
      startTime: progress.startTime,
      completedAt: new Date().toISOString()
    });

    console.log('\n=== Import Complete ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((updated / processed) * 100).toFixed(1)}%`);

    // Clean up progress file
    try {
      await fs.unlink(PROGRESS_FILE);
      console.log('Progress file cleaned up');
    } catch (error) {
      // Ignore if file doesn't exist
    }

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nImport interrupted. Progress saved. Run script again to resume.');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the import
importGameData();