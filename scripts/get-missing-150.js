const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function getMissing150() {
  console.log('🎯 Fetching the final 150 missing cards...\n');
  
  const apiUrl = 'https://pokemon-catelog-prod-production.up.railway.app/graphql';
  
  // We've tried pages 1-110 and 186
  // Let's try pages around the gaps
  const pagesToTry = [111, 112, 180, 181, 182, 183, 184, 185];
  
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
    // First check what IDs we already have
    const existingCards = await prisma.card.findMany({
      select: { pokemonTcgId: true },
      orderBy: { pokemonTcgId: 'asc' }
    });
    const existingIdSet = new Set(existingCards.map(c => c.pokemonTcgId));
    console.log(`📊 Current unique card IDs in database: ${existingIdSet.size}`);
    
    const allNewCards = [];
    
    for (const page of pagesToTry) {
      console.log(`\n📦 Trying page ${page}...`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { page, limit: 25 } // Smaller batch
          })
        });
        
        const result = await response.json();
        
        if (result.data?.searchCards?.cards) {
          const cards = result.data.searchCards.cards;
          const newCards = cards.filter(card => !existingIdSet.has(card.id));
          
          if (newCards.length > 0) {
            allNewCards.push(...newCards);
            console.log(`✅ Found ${newCards.length} NEW cards on page ${page}!`);
            newCards.slice(0, 3).forEach(card => {
              console.log(`   - ${card.name} (${card.rarity})`);
            });
          } else {
            console.log(`⚠️  All cards on page ${page} are duplicates`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed page ${page}:`, error.message);
      }
    }
    
    if (allNewCards.length > 0) {
      console.log(`\n📊 Found ${allNewCards.length} new unique cards!`);
      
      // Transform and save
      const transformedCards = allNewCards.map(card => ({
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
      
      // Import immediately
      console.log('\n📤 Importing new cards...');
      
      const imported = await prisma.card.createMany({
        data: transformedCards,
        skipDuplicates: true
      });
      
      console.log(`✅ Imported ${imported.count} new cards!`);
      
      // Final count
      const finalCount = await prisma.card.count();
      console.log(`\n🎯 Final count: ${finalCount.toLocaleString()} / 18,555`);
      console.log(`📊 Completion: ${((finalCount / 18555) * 100).toFixed(1)}%`);
    } else {
      console.log('\n❌ No new unique cards found in the tested pages');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getMissing150();