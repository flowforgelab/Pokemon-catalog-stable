// Import game data for a small batch of cards
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

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

async function importBatch() {
  console.log('Importing game data for first 10 cards...\n');
  
  try {
    // Get first 10 cards
    const cards = await prisma.card.findMany({
      take: 10,
      orderBy: { createdAt: 'asc' }
    });

    console.log('Cards to update:');
    cards.forEach(card => {
      console.log(`- ${card.name} (${card.pokemonTcgId})`);
    });
    console.log();

    let updated = 0;
    let failed = 0;

    for (const card of cards) {
      console.log(`Fetching data for ${card.pokemonTcgId}...`);
      
      // Fetch data from Pokemon TCG API
      const apiData = await fetchCardData(card.pokemonTcgId);
      
      if (apiData) {
        const result = await updateCardWithGameData(card, apiData);
        if (result) {
          console.log(`✓ Updated ${card.name}`);
          updated++;
        } else {
          console.log(`✗ Failed to update ${card.name}`);
          failed++;
        }
      } else {
        console.log(`✗ No API data found for ${card.pokemonTcgId}`);
        failed++;
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n=== Import Complete ===');
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);

    // Check results
    const firstCard = await prisma.card.findUnique({
      where: { id: cards[0].id },
      include: {
        attacks: true,
        abilities: true,
        weaknesses: true,
        resistances: true,
      }
    });

    console.log('\nFirst card now has:');
    console.log(`- Attacks: ${firstCard.attacks.length}`);
    console.log(`- Abilities: ${firstCard.abilities.length}`);
    console.log(`- Weaknesses: ${firstCard.weaknesses.length}`);
    console.log(`- Resistances: ${firstCard.resistances.length}`);
    console.log(`- Evolution: ${firstCard.evolvesFrom || 'None'}`);
    console.log(`- Retreat Cost: ${firstCard.retreatCost || 0}`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importBatch();