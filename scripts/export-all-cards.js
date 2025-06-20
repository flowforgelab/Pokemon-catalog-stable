const fs = require('fs').promises;
const path = require('path');

async function exportAllCards() {
  console.log('🚀 Starting full Pokemon card export from production API...');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  const batchSize = 50; // Smaller batch to avoid timeouts
  const delayMs = 200; // Delay between requests
  
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
  
  try {
    // First, get the total count
    console.log('📊 Getting total card count...');
    const firstResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { page: 1, limit: 1 }
      })
    });
    
    const firstData = await firstResponse.json();
    const total = firstData.data?.searchCards?.total || 0;
    console.log(`📊 Total cards to export: ${total}`);
    
    const totalPages = Math.ceil(total / batchSize);
    let allCards = [];
    let successfulPages = 0;
    let failedPages = 0;
    
    // Export in batches with error handling
    for (let page = 1; page <= totalPages; page++) {
      try {
        process.stdout.write(`\r📦 Fetching page ${page}/${totalPages} (${successfulPages} successful, ${failedPages} failed)...`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { page, limit: batchSize }
          })
        });
        
        const data = await response.json();
        
        if (data.errors) {
          console.error(`\n❌ Error on page ${page}:`, data.errors);
          failedPages++;
          continue;
        }
        
        const cards = data.data?.searchCards?.cards || [];
        allCards = allCards.concat(cards);
        successfulPages++;
        
        // Save progress every 1000 cards
        if (allCards.length % 1000 === 0) {
          await saveProgress(allCards);
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
      } catch (error) {
        console.error(`\n❌ Failed to fetch page ${page}:`, error.message);
        failedPages++;
        // Continue with next page
      }
    }
    
    console.log(`\n✅ Export complete! Successfully fetched ${allCards.length} cards`);
    
    // Transform to match our schema
    console.log('🔄 Transforming data to match schema...');
    const transformedCards = allCards.map(card => ({
      pokemonTcgId: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: [], // Will need to fetch from another source
      types: card.types || [],
      hp: card.hp,
      number: card.number || '',
      artist: card.artist || '',
      rarity: card.rarity || '',
      setId: '', // Will need to fetch from another source
      setName: card.setName || '',
      setSeries: card.setSeries || '',
      setTotal: 0, // Will need to fetch from another source
      imageSmall: card.imageSmall || '',
      imageLarge: card.imageLarge || card.imageSmall || '',
      marketPrice: card.marketPrice || null,
      tcgplayerUrl: card.tcgplayerUrl || null
    }));
    
    // Save final export
    const exportPath = path.join(__dirname, 'pokemon-cards-full-export.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(transformedCards, null, 2)
    );
    
    console.log(`✅ Exported ${transformedCards.length} cards to ${exportPath}`);
    console.log(`📊 Export summary:`);
    console.log(`   - Total cards: ${transformedCards.length}`);
    console.log(`   - Successful pages: ${successfulPages}`);
    console.log(`   - Failed pages: ${failedPages}`);
    console.log(`   - File size: ${(await fs.stat(exportPath)).size / 1024 / 1024} MB`);
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    console.error(error);
  }
}

async function saveProgress(cards) {
  const progressPath = path.join(__dirname, 'export-progress.json');
  await fs.writeFile(progressPath, JSON.stringify(cards, null, 2));
  console.log(`\n💾 Progress saved (${cards.length} cards)`);
}

// Run export
console.log('⚠️  This will take several minutes to export all 18,555 cards.');
console.log('The script will save progress periodically.\n');

exportAllCards();