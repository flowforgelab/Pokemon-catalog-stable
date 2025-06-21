import { DeckCard, PokemonCard } from '@/lib/types';

export interface DeckFormat {
  name: string;
  extension: string;
  export: (cards: (DeckCard & { card: PokemonCard })[], deckName: string) => string;
  parse: (content: string) => { name: string; quantity: number; set?: string; number?: string }[];
}

// Pokemon TCG Online format
export const ptcgoFormat: DeckFormat = {
  name: 'PTCGO',
  extension: 'txt',
  export: (cards, deckName) => {
    const pokemon = cards.filter(c => c.card.supertype === 'Pokémon');
    const trainers = cards.filter(c => c.card.supertype === 'Trainer');
    const energy = cards.filter(c => c.card.supertype === 'Energy');
    
    let output = `****** ${deckName} ******\n\n`;
    
    if (pokemon.length > 0) {
      output += `##Pokémon - ${pokemon.reduce((sum, c) => sum + c.quantity, 0)}\n\n`;
      pokemon.forEach(c => {
        output += `* ${c.quantity} ${c.card.name} ${c.card.setId.toUpperCase()} ${c.card.number}\n`;
      });
      output += '\n';
    }
    
    if (trainers.length > 0) {
      output += `##Trainer Cards - ${trainers.reduce((sum, c) => sum + c.quantity, 0)}\n\n`;
      trainers.forEach(c => {
        output += `* ${c.quantity} ${c.card.name} ${c.card.setId.toUpperCase()} ${c.card.number}\n`;
      });
      output += '\n';
    }
    
    if (energy.length > 0) {
      output += `##Energy - ${energy.reduce((sum, c) => sum + c.quantity, 0)}\n\n`;
      energy.forEach(c => {
        output += `* ${c.quantity} ${c.card.name} ${c.card.setId.toUpperCase()} ${c.card.number}\n`;
      });
      output += '\n';
    }
    
    output += `Total Cards - ${cards.reduce((sum, c) => sum + c.quantity, 0)}`;
    
    return output;
  },
  parse: (content) => {
    const lines = content.split('\n');
    const cards: { name: string; quantity: number; set?: string; number?: string }[] = [];
    
    for (const line of lines) {
      const match = line.match(/^\*?\s*(\d+)\s+(.+?)\s+([A-Z0-9-]+)\s+(\d+)\s*$/);
      if (match) {
        cards.push({
          quantity: parseInt(match[1]),
          name: match[2].trim(),
          set: match[3],
          number: match[4]
        });
      } else {
        // Try simple format: "4 Pikachu"
        const simpleMatch = line.match(/^\*?\s*(\d+)\s+(.+?)\s*$/);
        if (simpleMatch) {
          cards.push({
            quantity: parseInt(simpleMatch[1]),
            name: simpleMatch[2].trim()
          });
        }
      }
    }
    
    return cards;
  }
};

// Limitless TCG format
export const limitlessFormat: DeckFormat = {
  name: 'Limitless',
  extension: 'txt',
  export: (cards, deckName) => {
    let output = `${deckName}\n\n`;
    
    cards.forEach(c => {
      output += `${c.quantity} ${c.card.name} ${c.card.setId.toUpperCase()}${c.card.number ? ` ${c.card.number}` : ''}\n`;
    });
    
    return output.trim();
  },
  parse: (content) => {
    const lines = content.split('\n');
    const cards: { name: string; quantity: number; set?: string; number?: string }[] = [];
    
    for (const line of lines) {
      // Skip deck name and empty lines
      if (!line.trim() || !line.match(/^\d/)) continue;
      
      const match = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9-]+)(?:\s+(\d+))?\s*$/);
      if (match) {
        cards.push({
          quantity: parseInt(match[1]),
          name: match[2].trim(),
          set: match[3],
          number: match[4]
        });
      } else {
        const simpleMatch = line.match(/^(\d+)\s+(.+?)\s*$/);
        if (simpleMatch) {
          cards.push({
            quantity: parseInt(simpleMatch[1]),
            name: simpleMatch[2].trim()
          });
        }
      }
    }
    
    return cards;
  }
};

// Table format for spreadsheets
export const tableFormat: DeckFormat = {
  name: 'Table (CSV)',
  extension: 'csv',
  export: (cards) => {
    let output = 'Quantity,Card Name,Set,Number,Type,Rarity,Price\n';
    
    cards.forEach(c => {
      output += `${c.quantity},"${c.card.name}","${c.card.setName}",${c.card.number},${c.card.supertype},${c.card.rarity || ''},${c.card.marketPrice || '0'}\n`;
    });
    
    return output;
  },
  parse: (content) => {
    const lines = content.split('\n');
    const cards: { name: string; quantity: number; set?: string; number?: string }[] = [];
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('quantity') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (doesn't handle all edge cases)
      const parts = line.split(',');
      if (parts.length >= 2) {
        const quantity = parseInt(parts[0]);
        const name = parts[1].replace(/^"(.*)"$/, '$1');
        
        if (quantity && name) {
          cards.push({
            quantity,
            name,
            set: parts[2]?.replace(/^"(.*)"$/, '$1'),
            number: parts[3]?.replace(/^"(.*)"$/, '$1')
          });
        }
      }
    }
    
    return cards;
  }
};

export const formats = [ptcgoFormat, limitlessFormat, tableFormat];