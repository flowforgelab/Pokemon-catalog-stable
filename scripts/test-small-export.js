const fs = require('fs').promises;
const path = require('path');

async function testSmallExport() {
  console.log('🔍 Testing small export from production API...');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  
  const query = `
    query GetCards {
      searchCards(input: { page: 1, limit: 10 }) {
        total
        cards {
          id
          name
          supertype
          types
          hp
          rarity
          setName
          imageSmall
          marketPrice
        }
      }
    }
  `;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.data?.searchCards?.cards) {
      console.log(`\n✅ Successfully fetched ${data.data.searchCards.cards.length} cards`);
      console.log(`Total available: ${data.data.searchCards.total}`);
      
      // Save sample
      const exportPath = path.join(__dirname, 'sample-cards.json');
      await fs.writeFile(
        exportPath, 
        JSON.stringify(data.data.searchCards.cards, null, 2)
      );
      console.log(`Saved to ${exportPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSmallExport();