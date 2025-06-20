const fs = require('fs').promises;
const path = require('path');

async function exportMissingPage() {
  console.log('🎯 Fetching missing page 106 from production API...\n');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  const targetPage = 106;
  const batchSize = 100;
  
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
    console.log(`📦 Fetching page ${targetPage} with ${batchSize} cards...`);
    
    // Try multiple times with longer timeouts
    let attempts = 0;
    let data = null;
    
    while (attempts < 3 && !data) {
      attempts++;
      console.log(`\n🔄 Attempt ${attempts}/3...`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { page: targetPage, limit: batchSize }
          }),
          signal: AbortSignal.timeout(60000) // 60 second timeout
        });
        
        const result = await response.json();
        
        if (result.errors) {
          console.error(`❌ GraphQL errors:`, result.errors);
          throw new Error('GraphQL query failed');
        }
        
        data = result;
        console.log(`✅ Successfully fetched data!`);
        
      } catch (error) {
        console.error(`❌ Attempt ${attempts} failed:`, error.message);
        if (attempts < 3) {
          console.log(`⏳ Waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    if (!data || !data.data?.searchCards?.cards) {
      throw new Error('Failed to fetch data after 3 attempts');
    }
    
    const cards = data.data.searchCards.cards;
    console.log(`\n📊 Retrieved ${cards.length} cards from page ${targetPage}`);
    
    // Transform to match our schema
    console.log('🔄 Transforming data to match schema...');
    const transformedCards = cards.map(card => ({
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
    
    // Save the missing cards
    const exportPath = path.join(__dirname, 'missing-page-106.json');
    await fs.writeFile(
      exportPath, 
      JSON.stringify(transformedCards, null, 2)
    );
    
    console.log(`\n✅ Export Summary:`);
    console.log(`   - Cards exported: ${transformedCards.length}`);
    console.log(`   - Output file: ${exportPath}`);
    console.log(`   - File size: ${((await fs.stat(exportPath)).size / 1024).toFixed(2)} KB`);
    
    // Show sample of cards
    console.log(`\n📋 Sample of exported cards:`);
    transformedCards.slice(0, 5).forEach(card => {
      console.log(`   - ${card.name} (${card.rarity}) from ${card.setName}`);
    });
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    console.error(error);
    
    // Try alternative approach - fetch smaller batches
    console.log('\n🔄 Trying alternative approach with smaller batches...');
    await exportInSmallerBatches();
  }
}

async function exportInSmallerBatches() {
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  const smallBatchSize = 25;
  const startOffset = 10500; // Page 106 * 100 = 10500
  
  const query = `
    query GetCards($offset: Int!, $limit: Int!) {
      searchCards(input: { offset: $offset, limit: $limit }) {
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
    const allCards = [];
    
    // Fetch in 4 batches of 25
    for (let i = 0; i < 4; i++) {
      const offset = startOffset + (i * smallBatchSize);
      console.log(`\n📦 Fetching batch ${i + 1}/4 (offset: ${offset})...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { offset, limit: smallBatchSize }
        })
      });
      
      const data = await response.json();
      
      if (data.data?.searchCards?.cards) {
        allCards.push(...data.data.searchCards.cards);
        console.log(`✅ Got ${data.data.searchCards.cards.length} cards`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (allCards.length > 0) {
      // Transform and save
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
      
      const exportPath = path.join(__dirname, 'missing-page-106.json');
      await fs.writeFile(exportPath, JSON.stringify(transformedCards, null, 2));
      
      console.log(`\n✅ Alternative approach successful!`);
      console.log(`   Exported ${transformedCards.length} cards to ${exportPath}`);
    }
    
  } catch (error) {
    console.error('Alternative approach also failed:', error.message);
  }
}

// Run export
console.log('🔍 This script attempts to fetch the missing 250 cards from page 106.');
console.log('It will try multiple approaches to get the data.\n');

exportMissingPage();