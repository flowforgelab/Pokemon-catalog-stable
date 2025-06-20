const fs = require('fs').promises;
const path = require('path');

async function exportRemainingCards() {
  console.log('🚀 Starting export of remaining Pokemon cards from production API...');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  const batchSize = 100; // Larger batch size since we know it works
  const delayMs = 500; // Slightly longer delay to be safe
  const startPage = 91; // Start from page 91 (9000 cards / 100 per page = 90 pages done)
  
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
    // First, verify the total count
    console.log('📊 Verifying total card count...');
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
    console.log(`📊 Total cards in production: ${total}`);
    console.log(`📊 Already exported: 9,000`);
    console.log(`📊 Remaining to export: ${total - 9000}`);
    
    const totalPages = Math.ceil(total / batchSize);
    console.log(`📄 Starting from page ${startPage} of ${totalPages}`);
    
    let allCards = [];
    let successfulPages = 0;
    let failedPages = 0;
    const failedPageNumbers = [];
    
    // Export remaining batches
    for (let page = startPage; page <= totalPages; page++) {
      try {
        process.stdout.write(`\r📦 Fetching page ${page}/${totalPages} (${allCards.length} cards collected)...`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { page, limit: batchSize }
          }),
          timeout: 30000 // 30 second timeout
        });
        
        const data = await response.json();
        
        if (data.errors) {
          console.error(`\n❌ Error on page ${page}:`, data.errors);
          failedPages++;
          failedPageNumbers.push(page);
          continue;
        }
        
        const cards = data.data?.searchCards?.cards || [];
        if (cards.length === 0) {
          console.log(`\n⚠️  No cards returned for page ${page}`);
        } else {
          allCards = allCards.concat(cards);
          successfulPages++;
        }
        
        // Save progress every 500 cards
        if (allCards.length % 500 === 0 && allCards.length > 0) {
          await saveProgress(allCards, 'remaining-cards-progress.json');
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
      } catch (error) {
        console.error(`\n❌ Failed to fetch page ${page}:`, error.message);
        failedPages++;
        failedPageNumbers.push(page);
        
        // Longer delay after error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n✅ Export complete! Successfully fetched ${allCards.length} additional cards`);
    
    if (failedPages > 0) {
      console.log(`\n⚠️  Failed to fetch ${failedPages} pages: ${failedPageNumbers.join(', ')}`);
    }
    
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
    const exportPath = path.join(__dirname, 'remaining-cards-export.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(transformedCards, null, 2)
    );
    
    console.log(`\n✅ Export Summary:`);
    console.log(`   - New cards exported: ${transformedCards.length}`);
    console.log(`   - Expected remaining: ${total - 9000}`);
    console.log(`   - Successful pages: ${successfulPages}`);
    console.log(`   - Failed pages: ${failedPages}`);
    console.log(`   - Output file: ${exportPath}`);
    console.log(`   - File size: ${((await fs.stat(exportPath)).size / 1024 / 1024).toFixed(2)} MB`);
    
    if (transformedCards.length < (total - 9000)) {
      console.log(`\n⚠️  Warning: Exported fewer cards than expected.`);
      console.log(`   This might be due to failed pages or duplicates.`);
    }
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    console.error(error);
  }
}

async function saveProgress(cards, filename) {
  const progressPath = path.join(__dirname, filename);
  await fs.writeFile(progressPath, JSON.stringify(cards, null, 2));
  console.log(`\n💾 Progress saved (${cards.length} cards) to ${filename}`);
}

// Run export
console.log('⏱️  This will take several minutes to export the remaining ~9,555 cards.');
console.log('The script will save progress periodically and can be resumed if interrupted.\n');

exportRemainingCards();