const fs = require('fs').promises;
const path = require('path');

async function exportFromAPI() {
  console.log('🔍 Attempting to export cards from production API...');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  
  const query = `
    query GetAllCards($page: Int!, $limit: Int!) {
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
          setReleaseDate
          tcgplayerUrl
        }
      }
    }
  `;
  
  try {
    // First, get the total count
    const firstResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { page: 1, limit: 1 }
      })
    });
    
    const firstData = await firstResponse.json();
    
    if (firstData.errors) {
      throw new Error('GraphQL errors: ' + JSON.stringify(firstData.errors));
    }
    
    const total = firstData.data?.searchCards?.total || 0;
    console.log(`📊 Found ${total} cards to export`);
    
    if (total === 0) {
      throw new Error('No cards found in API');
    }
    
    // Export in batches
    const batchSize = 100;
    const totalPages = Math.ceil(total / batchSize);
    let allCards = [];
    
    for (let page = 1; page <= totalPages; page++) {
      console.log(`📦 Fetching page ${page}/${totalPages}...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { page, limit: batchSize }
        })
      });
      
      const data = await response.json();
      
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        continue;
      }
      
      const cards = data.data?.searchCards?.cards || [];
      allCards = allCards.concat(cards);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Transform to match our schema
    const transformedCards = allCards.map(card => ({
      pokemonTcgId: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: [], // Not in GraphQL response
      types: card.types || [],
      hp: card.hp,
      number: card.number,
      artist: card.artist,
      rarity: card.rarity,
      setId: '', // Not in GraphQL response
      setName: card.setName,
      setSeries: card.setSeries || '',
      setTotal: 0, // Not in GraphQL response
      imageSmall: card.imageSmall,
      imageLarge: card.imageLarge || card.imageSmall,
      marketPrice: card.marketPrice,
      tcgplayerUrl: card.tcgplayerUrl
    }));
    
    // Save to JSON file
    const exportPath = path.join(__dirname, 'pokemon-cards-api-export.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(transformedCards, null, 2)
    );
    
    console.log(`✅ Exported ${transformedCards.length} cards to ${exportPath}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    
    // Try direct database query as fallback
    console.log('\n🔄 Trying alternative: Do you have access to Railway dashboard?');
    console.log('You could run this SQL query directly in Railway:');
    console.log(`
SELECT 
  id, "tcgId", name, supertype, subtypes, types, hp, 
  number, artist, rarity, "setId", "setName", "setSeries", 
  "setTotal", "imageSmall", "imageLarge", "marketPrice", "tcgplayerUrl"
FROM "Card"
LIMIT 20000;
    `);
  }
}

// Run export
exportFromAPI();