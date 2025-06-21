// Optimized import script with rate limit handling and retry logic
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
const BATCH_SIZE = 10; // Smaller batch size to avoid rate limits
const INITIAL_DELAY_MS = 1000; // 1 second between requests initially
const MAX_RETRIES = 3;
const PROGRESS_FILE = path.join(__dirname, 'import-progress-optimized.json');

// Rate limit tracking
let currentDelay = INITIAL_DELAY_MS;
let consecutiveErrors = 0;

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
      startTime: new Date().toISOString(),
      failedCards: []
    };
  }
}

// Save progress to file
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function fetchCardDataWithRetry(pokemonTcgId, retries = 0) {
  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`, {
      headers: {
        'User-Agent': 'Pokemon-Catalog-Import/1.0',
        'Accept': 'application/json',
      }
    });
    
    if (response.status === 429) {
      // Rate limited - exponential backoff
      consecutiveErrors++;
      currentDelay = Math.min(currentDelay * 2, 60000); // Max 60 seconds
      console.log(`Rate limited. Increasing delay to ${currentDelay}ms`);
      
      if (retries < MAX_RETRIES) {
        await delay(currentDelay);
        return fetchCardDataWithRetry(pokemonTcgId, retries + 1);
      }
      return null;
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Card not found in API: ${pokemonTcgId}`);
      } else {
        console.error(`Failed to fetch ${pokemonTcgId}: ${response.status}`);
      }
      return null;
    }
    
    // Success - reset delay
    consecutiveErrors = 0;
    if (currentDelay > INITIAL_DELAY_MS) {
      currentDelay = Math.max(INITIAL_DELAY_MS, currentDelay / 2);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${pokemonTcgId}:`, error.message);
    if (retries < MAX_RETRIES) {
      await delay(currentDelay);
      return fetchCardDataWithRetry(pokemonTcgId, retries + 1);
    }
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
  console.log('Starting optimized game data import with rate limit handling...');
  console.log('Initial delay between requests:', INITIAL_DELAY_MS, 'ms');
  
  try {
    // Load previous progress
    const progress = await loadProgress();
    console.log('Loading progress:', {
      ...progress,
      failedCards: progress.failedCards?.length || 0
    });

    // Get cards that don't have game data yet
    const cardsWithoutGameData = await prisma.card.findMany({
      where: {
        OR: [
          { attacks: { none: {} } },
          { abilities: { none: {} } },
          { retreatCost: null }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${cardsWithoutGameData.length} cards without complete game data`);

    let processed = 0;
    let updated = 0;
    let failed = 0;
    const failedCards = [];

    for (let i = 0; i < cardsWithoutGameData.length; i += BATCH_SIZE) {
      const batch = cardsWithoutGameData.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} cards)`);

      for (const card of batch) {
        processed++;
        
        // Show progress
        const progressPercent = ((processed / cardsWithoutGameData.length) * 100).toFixed(1);
        const elapsed = Date.now() - new Date(progress.startTime).getTime();
        const rate = processed / (elapsed / 1000 / 60); // cards per minute
        const remaining = (cardsWithoutGameData.length - processed) / rate; // minutes remaining
        
        if (processed % 10 === 0) {
          console.log(`Progress: ${processed}/${cardsWithoutGameData.length} (${progressPercent}%) - ${rate.toFixed(0)} cards/min - ~${remaining.toFixed(0)} min remaining`);
          console.log(`Current delay: ${currentDelay}ms, Success rate: ${((updated / processed) * 100).toFixed(1)}%`);
        }

        // Fetch data from Pokemon TCG API
        const apiData = await fetchCardDataWithRetry(card.pokemonTcgId);
        
        if (apiData) {
          const result = await updateCardWithGameData(card, apiData);
          if (result) {
            updated++;
            console.log(`✓ Updated ${card.name} (${card.pokemonTcgId})`);
          } else {
            failed++;
            failedCards.push(card.pokemonTcgId);
          }
        } else {
          failed++;
          failedCards.push(card.pokemonTcgId);
          console.log(`✗ Failed ${card.pokemonTcgId}`);
        }

        // Save progress periodically
        if (processed % 50 === 0) {
          await saveProgress({
            lastProcessedIndex: i + batch.indexOf(card),
            totalProcessed: processed,
            successCount: updated,
            failCount: failed,
            startTime: progress.startTime,
            failedCards
          });
        }

        // Delay between API calls
        await delay(currentDelay);
      }
    }

    // Final save
    await saveProgress({
      lastProcessedIndex: cardsWithoutGameData.length,
      totalProcessed: processed,
      successCount: updated,
      failCount: failed,
      startTime: progress.startTime,
      completedAt: new Date().toISOString(),
      failedCards
    });

    console.log('\n=== Import Complete ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((updated / processed) * 100).toFixed(1)}%`);
    
    if (failedCards.length > 0) {
      console.log(`\nFailed cards saved to progress file for retry`);
    }

    // Check overall completion
    const totalCards = await prisma.card.count();
    const cardsWithAttacks = await prisma.card.count({
      where: {
        attacks: { some: {} }
      }
    });
    
    console.log(`\nOverall game data coverage: ${cardsWithAttacks}/${totalCards} (${((cardsWithAttacks / totalCards) * 100).toFixed(1)}%)`);

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