#!/usr/bin/env node
// Daily game data import script - maximizes 1000 requests/day limit
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;
const DAILY_LIMIT = 950; // Leave some buffer (950 instead of 1000)
const PROGRESS_FILE = path.join(__dirname, 'import-progress-daily.json');

if (!API_KEY) {
  console.error('❌ POKEMON_TCG_API_KEY not found in .env.local');
  process.exit(1);
}

async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      processedCardIds: [],
      lastRunDate: null,
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      completedSets: [],
      currentSet: null
    };
  }
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function fetchCardData(pokemonTcgId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`, {
      headers: {
        'X-Api-Key': API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Pokemon-Catalog-Import/1.0'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Failed ${pokemonTcgId}: HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log(`❌ Error ${pokemonTcgId}: ${error.message}`);
    return null;
  }
}

async function updateCardWithGameData(card, apiData) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update card with game data
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

      // Clear existing relations
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

async function importDailyBatch() {
  console.log('🚀 Daily Game Data Import');
  console.log('========================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`Daily Limit: ${DAILY_LIMIT} requests\n`);

  const startTime = Date.now();
  const progress = await loadProgress();
  
  // Check if already run today
  const today = new Date().toDateString();
  const lastRun = progress.lastRunDate ? new Date(progress.lastRunDate).toDateString() : null;
  
  if (lastRun === today) {
    console.log('⚠️  Already run today. Will run again tomorrow.');
    await prisma.$disconnect();
    return;
  }

  try {
    // Get cards that need game data
    const processedIds = new Set(progress.processedCardIds || []);
    
    // Focus on Pokemon cards first, then trainers
    const cardsNeedingData = await prisma.card.findMany({
      where: {
        AND: [
          { NOT: { id: { in: Array.from(processedIds) } } },
          {
            OR: [
              { attacks: { none: {} } },
              { retreatCost: null }
            ]
          }
        ]
      },
      orderBy: [
        { supertype: 'asc' }, // Pokemon first
        { setName: 'desc' },  // Newer sets first
        { number: 'asc' }
      ],
      take: DAILY_LIMIT + 50 // Get extra in case some fail
    });

    console.log(`Found ${cardsNeedingData.length} cards needing game data`);
    console.log(`Previously processed: ${processedIds.size} cards\n`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const card of cardsNeedingData) {
      if (processed >= DAILY_LIMIT) {
        console.log(`\n⚠️  Daily limit reached (${DAILY_LIMIT} requests)`);
        break;
      }

      processed++;
      
      // Progress update every 50 cards
      if (processed % 50 === 0) {
        console.log(`\nProgress: ${processed}/${DAILY_LIMIT} requests`);
        console.log(`Success: ${succeeded} | Failed: ${failed} | Skipped: ${skipped}`);
        console.log(`Rate: ${(processed / ((Date.now() - startTime) / 1000 / 60)).toFixed(0)} cards/min`);
      }

      // Fetch card data
      const apiData = await fetchCardData(card.pokemonTcgId);
      
      if (!apiData) {
        console.log(`❌ ${card.pokemonTcgId}: ${card.name} - No data`);
        failed++;
      } else {
        // Check if card has meaningful game data
        const hasGameData = apiData.attacks?.length > 0 || 
                           apiData.abilities?.length > 0 || 
                           apiData.evolvesFrom || 
                           apiData.evolvesTo?.length > 0;
        
        if (!hasGameData && card.supertype === 'Pokémon') {
          console.log(`⏭️  ${card.pokemonTcgId}: ${card.name} - No game data`);
          skipped++;
        } else {
          const updated = await updateCardWithGameData(card, apiData);
          if (updated) {
            console.log(`✅ ${card.pokemonTcgId}: ${card.name}`);
            succeeded++;
          } else {
            console.log(`❌ ${card.pokemonTcgId}: ${card.name} - Update failed`);
            failed++;
          }
        }
      }

      // Mark as processed
      progress.processedCardIds.push(card.id);
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update progress
    progress.lastRunDate = new Date().toISOString();
    progress.totalProcessed += processed;
    progress.totalSuccess += succeeded;
    progress.totalFailed += failed;
    await saveProgress(progress);

    // Summary
    console.log('\n📊 Daily Import Summary');
    console.log('======================');
    console.log(`Processed: ${processed} cards`);
    console.log(`Succeeded: ${succeeded}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);
    console.log(`\nTotal Progress:`);
    console.log(`Lifetime Processed: ${progress.totalProcessed}`);
    console.log(`Lifetime Success: ${progress.totalSuccess}`);

    // Check overall progress
    const totalCards = await prisma.card.count({ where: { supertype: 'Pokémon' } });
    const cardsWithAttacks = await prisma.card.count({
      where: {
        supertype: 'Pokémon',
        attacks: { some: {} }
      }
    });
    
    console.log(`\n📈 Database Status`);
    console.log(`Pokemon with game data: ${cardsWithAttacks}/${totalCards} (${(cardsWithAttacks/totalCards*100).toFixed(1)}%)`);
    
    const daysRemaining = Math.ceil((totalCards - cardsWithAttacks) / (succeeded || 1));
    console.log(`Estimated days to complete: ${daysRemaining}`);
    
    // Send notification or log
    console.log(`\n✅ Daily import complete. Next run: tomorrow`);

  } catch (error) {
    console.error('\n❌ Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// If running directly, execute import
if (require.main === module) {
  importDailyBatch();
}

module.exports = { importDailyBatch };