// Script to retry importing failed cards with better rate limit handling
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

// Get Pokemon TCG API key from environment if available
const API_KEY = process.env.POKEMON_TCG_API_KEY;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCardWithAuth(pokemonTcgId) {
  const headers = {
    'User-Agent': 'Pokemon-Catalog-Import/1.0',
    'Accept': 'application/json',
  };
  
  // Add API key if available
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${pokemonTcgId}`, { headers });
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.log(`Rate limited. Retry after: ${retryAfter || 'unknown'} seconds`);
      return { error: 'rate-limited', retryAfter };
    }
    
    if (response.status === 404) {
      return { error: 'not-found' };
    }
    
    if (!response.ok) {
      return { error: `http-${response.status}` };
    }
    
    const data = await response.json();
    return { data: data.data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testRateLimit() {
  console.log('Testing Pokemon TCG API rate limits...\n');
  
  if (API_KEY) {
    console.log('✓ Using API key for authentication');
  } else {
    console.log('⚠ No API key found. Consider adding POKEMON_TCG_API_KEY to .env.local');
    console.log('  Get a free key at: https://dev.pokemontcg.io/\n');
  }

  // Test a few cards to understand rate limits
  const testCards = ['sv1-1', 'sv1-2', 'sv1-3', 'sv1-4', 'sv1-5'];
  let successCount = 0;
  let rateLimitHit = false;
  
  for (let i = 0; i < testCards.length; i++) {
    const cardId = testCards[i];
    console.log(`Testing card ${i + 1}/${testCards.length}: ${cardId}`);
    
    const result = await fetchCardWithAuth(cardId);
    
    if (result.data) {
      successCount++;
      console.log(`✓ Success: ${result.data.name}`);
    } else if (result.error === 'rate-limited') {
      rateLimitHit = true;
      console.log(`✗ Rate limited after ${i} requests`);
      break;
    } else {
      console.log(`✗ Error: ${result.error}`);
    }
    
    // Small delay between requests
    if (i < testCards.length - 1) {
      await delay(100);
    }
  }
  
  console.log('\n--- Rate Limit Test Results ---');
  console.log(`Successful requests: ${successCount}`);
  console.log(`Rate limit hit: ${rateLimitHit ? 'Yes' : 'No'}`);
  
  if (!API_KEY && rateLimitHit) {
    console.log('\n⚠ RECOMMENDATION: Add an API key to increase rate limits');
    console.log('Without API key: 20 requests per 5 seconds');
    console.log('With API key: 1000 requests per day');
  }
}

async function analyzeFailedCards() {
  console.log('\n\nAnalyzing cards without game data...\n');
  
  // Find cards without attacks (indicator of missing game data)
  const cardsWithoutAttacks = await prisma.card.count({
    where: {
      attacks: { none: {} }
    }
  });
  
  const totalCards = await prisma.card.count();
  
  console.log(`Total cards: ${totalCards}`);
  console.log(`Cards without attacks: ${cardsWithoutAttacks}`);
  console.log(`Cards with game data: ${totalCards - cardsWithoutAttacks} (${((totalCards - cardsWithoutAttacks) / totalCards * 100).toFixed(1)}%)`);
  
  // Sample some cards without data
  const sampleCards = await prisma.card.findMany({
    where: {
      attacks: { none: {} }
    },
    take: 10,
    select: {
      pokemonTcgId: true,
      name: true,
      setName: true
    }
  });
  
  console.log('\nSample cards missing game data:');
  sampleCards.forEach(card => {
    console.log(`- ${card.pokemonTcgId}: ${card.name} (${card.setName})`);
  });
}

async function suggestOptimalStrategy() {
  console.log('\n\n--- Optimal Import Strategy ---\n');
  
  const cardsWithoutData = await prisma.card.count({
    where: {
      attacks: { none: {} }
    }
  });
  
  if (API_KEY) {
    console.log('✓ API key detected - You can make 1000 requests per day');
    console.log(`✓ Cards to import: ${cardsWithoutData}`);
    console.log(`✓ Days to complete: ${Math.ceil(cardsWithoutData / 1000)}`);
    console.log('\nRecommended approach:');
    console.log('1. Run import-game-data-optimized.js with 500ms delay');
    console.log('2. Process ~900 cards per day to stay under limit');
  } else {
    console.log('⚠ No API key - Limited to 20 requests per 5 seconds');
    console.log(`⚠ Cards to import: ${cardsWithoutData}`);
    console.log(`⚠ Time to complete: ~${Math.ceil(cardsWithoutData / 240)} hours`);
    console.log('\n🔑 STRONGLY RECOMMENDED: Get a free API key');
    console.log('1. Visit https://dev.pokemontcg.io/');
    console.log('2. Sign up for free account');
    console.log('3. Add to .env.local: POKEMON_TCG_API_KEY=your-key-here');
  }
}

async function main() {
  try {
    await testRateLimit();
    await analyzeFailedCards();
    await suggestOptimalStrategy();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();