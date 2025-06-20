const fs = require('fs').promises;
const path = require('path');

async function findMissingCards() {
  console.log('🔍 Analyzing which cards are missing...\n');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  
  // Get total count
  const query = `
    query GetTotal {
      searchCards(input: { page: 1, limit: 1 }) {
        total
      }
    }
  `;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    const total = result.data?.searchCards?.total || 0;
    
    console.log(`📊 Total cards in production: ${total}`);
    console.log(`📊 We have imported: 18,405`);
    console.log(`📊 Missing: ${total - 18405}`);
    
    // Try to get the last 200 cards with offset
    const offsetQuery = `
      query GetLastCards($offset: Int!, $limit: Int!) {
        searchCards(input: { offset: $offset, limit: $limit }) {
          total
          cards {
            id
            name
            rarity
            setName
          }
        }
      }
    `;
    
    console.log(`\n🔍 Fetching last 200 cards to find missing ones...`);
    
    const lastCardsResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: offsetQuery,
        variables: { offset: 18355, limit: 200 }
      })
    });
    
    const lastCardsResult = await lastCardsResponse.json();
    const lastCards = lastCardsResult.data?.searchCards?.cards || [];
    
    console.log(`\n📋 Sample of last cards in production:`);
    lastCards.slice(0, 10).forEach(card => {
      console.log(`   - ${card.id}: ${card.name} (${card.rarity}) from ${card.setName}`);
    });
    
    // Save these IDs for comparison
    const lastCardIds = lastCards.map(c => c.id);
    await fs.writeFile(
      path.join(__dirname, 'last-200-card-ids.json'),
      JSON.stringify(lastCardIds, null, 2)
    );
    
    console.log(`\n💡 Saved ${lastCardIds.length} card IDs to check against our database`);
    
  } catch (error) {
    console.error('❌ Failed to analyze:', error.message);
  }
}

findMissingCards();