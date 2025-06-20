const fs = require('fs').promises;
const path = require('path');

async function exportFinalMissing() {
  console.log('🎯 Fetching final missing cards from production API...\n');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  const batchSize = 100;
  
  // We have 18,305 cards, need 18,555 total
  // Already fetched up to page 185 + page 106
  // Need to check pages 107-110 and 186
  const missingPages = [107, 108, 109, 110, 186];
  
  const query = `
    query GetCards($page: Int!, $limit: Int!) {
      searchCards(input: { page: $page, limit: $limit }) {
        total
        cards {
          id
          name
          supertype
          types
          hp
          rarity
          setName
          setSeries
          artist
          imageSmall
          imageLarge
          marketPrice
          number
          tcgplayerUrl
        }
      }
    }
  `;
  
  const allCards = [];
  
  for (const page of missingPages) {
    console.log(`\n📦 Fetching page ${page}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { page, limit: batchSize }
        }),
        signal: AbortSignal.timeout(30000)
      });
      
      const result = await response.json();
      
      if (result.data?.searchCards?.cards) {
        const cards = result.data.searchCards.cards;
        allCards.push(...cards);
        console.log(`✅ Got ${cards.length} cards from page ${page}`);
      } else {
        console.log(`⚠️  No cards returned for page ${page}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to fetch page ${page}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total cards collected: ${allCards.length}`);
  
  if (allCards.length > 0) {
    // Transform to match our schema
    console.log('🔄 Transforming data to match schema...');
    const transformedCards = allCards.map(card => ({
      pokemonTcgId: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: [],
      types: card.types || [],
      hp: card.hp,
      number: card.number || '',
      artist: card.artist || '',
      rarity: card.rarity || '',
      setId: '',
      setName: card.setName || '',
      setSeries: card.setSeries || '',
      setTotal: 0,
      imageSmall: card.imageSmall || '',
      imageLarge: card.imageLarge || card.imageSmall || '',
      marketPrice: card.marketPrice || null,
      tcgplayerUrl: card.tcgplayerUrl || null
    }));
    
    // Save the final missing cards
    const exportPath = path.join(__dirname, 'final-missing-cards.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(transformedCards, null, 2)
    );
    
    console.log(`\n✅ Export Summary:`);
    console.log(`   - Cards exported: ${transformedCards.length}`);
    console.log(`   - Output file: ${exportPath}`);
    
    // Show breakdown by set
    const sets = {};
    transformedCards.forEach(card => {
      sets[card.setName] = (sets[card.setName] || 0) + 1;
    });
    
    console.log(`\n📋 Cards by set:`);
    Object.entries(sets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([set, count]) => {
        console.log(`   - ${set}: ${count} cards`);
      });
  }
}

// Run export
console.log('🔍 This script fetches the final missing cards to reach 100% migration.');

exportFinalMissing();