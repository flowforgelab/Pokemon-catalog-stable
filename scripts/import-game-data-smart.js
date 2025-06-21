#!/usr/bin/env node
// Smart import script that adapts to API rate limits
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;
const PROGRESS_FILE = path.join(__dirname, 'import-progress-smart.json');

// Rate limit configuration
const RATE_LIMITS = {
  withKey: {
    requestsPerDay: 1000,
    delayMs: 100, // 100ms between requests
    batchSize: 50
  },
  withoutKey: {
    requestsPer5Seconds: 20,
    delayMs: 300, // 300ms between requests (slower but safer)
    batchSize: 15
  }
};

const config = API_KEY ? RATE_LIMITS.withKey : RATE_LIMITS.withoutKey;

// Progress tracking
let requestsToday = 0;
const startTime = new Date();

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    const progress = JSON.parse(data);
    
    // Reset daily counter if it's a new day
    const lastRun = new Date(progress.lastRun || progress.startTime);
    const today = new Date();
    if (lastRun.toDateString() !== today.toDateString()) {
      progress.requestsToday = 0;
    }
    
    return progress;
  } catch (error) {
    return {
      processedCards: [],
      failedCards: [],
      requestsToday: 0,
      startTime: new Date().toISOString(),
      lastRun: new Date().toISOString()
    };
  }
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify({
    ...progress,
    lastRun: new Date().toISOString()
  }, null, 2));
}

async function fetchCardData(pokemonTcgId) {
  const headers = {
    'User-Agent': 'Pokemon-Catalog-Import/1.0',
    'Accept': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`, { headers });
    requestsToday++;
    
    if (response.status === 429) {
      console.log(`⚠ Rate limited at ${requestsToday} requests`);
      return null;
    }
    
    if (response.status === 404) {
      return null; // Card doesn't exist in API
    }
    
    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${pokemonTcgId}`);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Network error for ${pokemonTcgId}:`, error.message);
    return null;
  }
}

async function updateCardWithGameData(card, apiData) {
  try {
    // Only update if we have meaningful game data
    const hasGameData = apiData.attacks?.length > 0 || 
                       apiData.abilities?.length > 0 || 
                       apiData.evolvesFrom || 
                       apiData.evolvesTo?.length > 0;
    
    if (!hasGameData && card.supertype !== 'Trainer' && card.supertype !== 'Energy') {
      return null; // Skip cards without game data
    }

    await prisma.$transaction(async (tx) => {
      // Update card
      await tx.card.update({
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

      // Clear existing data
      await tx.attack.deleteMany({ where: { cardId: card.id } });
      await tx.ability.deleteMany({ where: { cardId: card.id } });
      await tx.weakness.deleteMany({ where: { cardId: card.id } });
      await tx.resistance.deleteMany({ where: { cardId: card.id } });

      // Add attacks
      if (apiData.attacks?.length > 0) {
        await tx.attack.createMany({
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
      if (apiData.abilities?.length > 0) {
        await tx.ability.createMany({
          data: apiData.abilities.map(ability => ({
            cardId: card.id,
            name: ability.name,
            type: ability.type || 'Ability',
            text: ability.text || '',
          }))
        });
      }

      // Add weaknesses
      if (apiData.weaknesses?.length > 0) {
        await tx.weakness.createMany({
          data: apiData.weaknesses.map(weakness => ({
            cardId: card.id,
            type: weakness.type,
            value: weakness.value,
          }))
        });
      }

      // Add resistances
      if (apiData.resistances?.length > 0) {
        await tx.resistance.createMany({
          data: apiData.resistances.map(resistance => ({
            cardId: card.id,
            type: resistance.type,
            value: resistance.value,
          }))
        });
      }
    });

    return true;
  } catch (error) {
    console.error(`DB error for ${card.pokemonTcgId}:`, error.message);
    return false;
  }
}

async function importGameData() {
  console.log('🚀 Smart Game Data Import');
  console.log('========================');
  console.log(`Mode: ${API_KEY ? 'WITH API KEY' : 'NO API KEY'}`);
  console.log(`Rate limit: ${API_KEY ? '1000/day' : '20/5sec'}`);
  console.log(`Delay between requests: ${config.delayMs}ms\n`);

  try {
    const progress = await loadProgress();
    requestsToday = progress.requestsToday || 0;

    // Get cards that need game data (excluding already processed)
    const processedIds = new Set(progress.processedCards || []);
    const allCards = await prisma.card.findMany({
      where: {
        AND: [
          { supertype: 'Pokémon' }, // Focus on Pokemon cards first
          { 
            NOT: { 
              id: { in: Array.from(processedIds) } 
            } 
          }
        ]
      },
      select: {
        id: true,
        pokemonTcgId: true,
        name: true,
        supertype: true,
        attacks: true
      },
      orderBy: [
        { setName: 'desc' }, // Newer sets first
        { number: 'asc' }
      ]
    });

    // Filter to cards without attacks
    const cardsNeedingData = allCards.filter(card => card.attacks.length === 0);
    console.log(`Found ${cardsNeedingData.length} Pokemon cards needing game data`);

    // Calculate how many we can process
    let maxRequests = Infinity;
    if (API_KEY) {
      maxRequests = Math.min(1000 - requestsToday, cardsNeedingData.length);
      console.log(`Can process up to ${maxRequests} cards today\n`);
    }

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < Math.min(cardsNeedingData.length, maxRequests); i++) {
      const card = cardsNeedingData[i];
      processed++;

      // Progress update
      if (processed % 10 === 0 || processed === 1) {
        const percent = ((processed / cardsNeedingData.length) * 100).toFixed(1);
        const rate = processed / ((Date.now() - startTime) / 1000 / 60);
        console.log(`\nProgress: ${processed}/${cardsNeedingData.length} (${percent}%)`);
        console.log(`Rate: ${rate.toFixed(0)} cards/min | Success: ${succeeded} | Failed: ${failed}`);
        
        if (API_KEY) {
          console.log(`Daily requests: ${requestsToday}/1000`);
        }
      }

      // Fetch from API
      const apiData = await fetchCardData(card.pokemonTcgId);
      
      if (!apiData) {
        console.log(`✗ ${card.pokemonTcgId}: ${card.name} - No API data`);
        failed++;
        progress.failedCards.push(card.pokemonTcgId);
      } else {
        const updated = await updateCardWithGameData(card, apiData);
        if (updated) {
          console.log(`✓ ${card.pokemonTcgId}: ${card.name}`);
          succeeded++;
        } else {
          console.log(`○ ${card.pokemonTcgId}: ${card.name} - No game data`);
          skipped++;
        }
      }

      progress.processedCards.push(card.id);
      progress.requestsToday = requestsToday;

      // Save progress every 50 cards
      if (processed % 50 === 0) {
        await saveProgress(progress);
      }

      // Rate limiting
      if (!API_KEY && processed % 20 === 0) {
        console.log('⏸ Rate limit pause (5 seconds)...');
        await delay(5000);
      } else {
        await delay(config.delayMs);
      }

      // Stop if we hit daily limit
      if (API_KEY && requestsToday >= 1000) {
        console.log('\n⚠ Daily API limit reached. Resume tomorrow.');
        break;
      }
    }

    // Final save
    await saveProgress(progress);

    // Summary
    console.log('\n📊 Import Summary');
    console.log('================');
    console.log(`Processed: ${processed} cards`);
    console.log(`Succeeded: ${succeeded} (${(succeeded/processed*100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped} (no game data)`);
    console.log(`Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);

    // Overall progress
    const totalCards = await prisma.card.count({ where: { supertype: 'Pokémon' } });
    const cardsWithAttacks = await prisma.card.count({
      where: {
        supertype: 'Pokémon',
        attacks: { some: {} }
      }
    });
    
    console.log(`\n📈 Overall Progress`);
    console.log(`Pokemon with game data: ${cardsWithAttacks}/${totalCards} (${(cardsWithAttacks/totalCards*100).toFixed(1)}%)`);
    
    const remaining = totalCards - cardsWithAttacks;
    if (remaining > 0) {
      if (API_KEY) {
        console.log(`Days to complete: ~${Math.ceil(remaining / 800)} (at 800/day)`);
      } else {
        console.log(`Time to complete: ~${Math.ceil(remaining * config.delayMs / 1000 / 60 / 60)} hours`);
        console.log('\n💡 TIP: Get a free API key to speed this up 50x!');
        console.log('   Visit: https://dev.pokemontcg.io/');
      }
    }

  } catch (error) {
    console.error('\n❌ Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏸ Import paused. Progress saved.');
  await prisma.$disconnect();
  process.exit(0);
});

// Run
importGameData();