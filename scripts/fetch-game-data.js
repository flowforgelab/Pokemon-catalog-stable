// Script to fetch complete card data from Pokemon TCG API
// This will get all the game mechanics we're missing

const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

async function fetchCardWithGameData(cardId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API}/cards/${cardId}`);
    const data = await response.json();
    
    if (data.data) {
      const card = data.data;
      
      // Extract game data we need
      return {
        id: card.id,
        name: card.name,
        
        // Game mechanics
        attacks: card.attacks || [],
        abilities: card.abilities || [],
        weaknesses: card.weaknesses || [],
        resistances: card.resistances || [],
        retreatCost: card.retreatCost ? card.retreatCost.length : 0,
        
        // Evolution data
        evolvesFrom: card.evolvesFrom || null,
        evolvesTo: card.evolvesTo || [],
        
        // Rules and legality
        rules: card.rules || [],
        legalities: card.legalities || {},
        regulationMark: card.regulationMark || null,
        
        // Additional data for AI
        supertype: card.supertype,
        subtypes: card.subtypes || [],
        hp: card.hp || null,
        types: card.types || [],
        
        // Raw data for reference
        raw: card
      };
    }
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    return null;
  }
}

// Test with a known card
async function test() {
  // Charizard ex from Scarlet & Violet base
  const testCard = await fetchCardWithGameData('sv1-54');
  console.log(JSON.stringify(testCard, null, 2));
}

test();