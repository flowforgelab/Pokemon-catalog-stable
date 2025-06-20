import { Card, Collection, Deck, User, PokemonType, CardRarity } from '@/lib/types/index';
import { POKEMON_TYPES, CARD_RARITIES } from '@/lib/types/index';

// Type Guards
export function isCard(obj: any): obj is Card {
  return (
    obj &&
    typeof obj === 'object' &&
    'pokemonTcgId' in obj &&
    'name' in obj &&
    'supertype' in obj
  );
}

export function isCollection(obj: any): obj is Collection {
  return (
    obj &&
    typeof obj === 'object' &&
    'userId' in obj &&
    'name' in obj &&
    'isPublic' in obj
  );
}

export function isDeck(obj: any): obj is Deck {
  return (
    obj &&
    typeof obj === 'object' &&
    'userId' in obj &&
    'name' in obj &&
    'format' in obj
  );
}

export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    'email' in obj &&
    'id' in obj
  );
}

// Validation Functions
export function isPokemonType(type: string): type is PokemonType {
  return POKEMON_TYPES.includes(type as PokemonType);
}

export function isCardRarity(rarity: string): rarity is CardRarity {
  return CARD_RARITIES.includes(rarity as CardRarity);
}

// Utility Type Functions
export function getCardTypeColors(types: string[]): string[] {
  return types
    .filter(isPokemonType)
    .map(type => {
      switch (type) {
        case 'Grass': return 'bg-green-500';
        case 'Fire': return 'bg-red-500';
        case 'Water': return 'bg-blue-500';
        case 'Lightning': return 'bg-yellow-500';
        case 'Psychic': return 'bg-purple-500';
        case 'Fighting': return 'bg-orange-600';
        case 'Darkness': return 'bg-gray-800';
        case 'Metal': return 'bg-gray-500';
        case 'Fairy': return 'bg-pink-500';
        case 'Dragon': return 'bg-indigo-600';
        case 'Colorless': return 'bg-gray-400';
        default: return 'bg-gray-400';
      }
    });
}

export function getRarityColor(rarity: string): string {
  if (!isCardRarity(rarity)) return 'text-gray-600';
  
  switch (rarity) {
    case 'Common': return 'text-gray-600';
    case 'Uncommon': return 'text-green-600';
    case 'Rare': return 'text-blue-600';
    case 'Rare Holo': return 'text-purple-600';
    case 'Rare Ultra': return 'text-orange-600';
    case 'Rare Secret': return 'text-pink-600';
    case 'Rare Rainbow': return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500';
    case 'Rare Holo V': return 'text-red-600';
    case 'Rare Holo VMAX': return 'text-red-700';
    case 'Rare Holo VSTAR': return 'text-yellow-500';
    case 'Promo': return 'text-cyan-600';
    default: return 'text-gray-600';
  }
}

// Format Helpers
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatCardCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}