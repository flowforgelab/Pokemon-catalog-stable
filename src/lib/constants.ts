import { PokemonType, CardRarity, AnimeEra } from '@/lib/types/index';

// Pokemon Type Colors (matching official TCG colors)
export const TYPE_COLORS: Record<PokemonType, string> = {
  Grass: '#4CAF50',
  Fire: '#F44336',
  Water: '#2196F3',
  Lightning: '#FFC107',
  Psychic: '#9C27B0',
  Fighting: '#FF5722',
  Darkness: '#424242',
  Metal: '#607D8B',
  Fairy: '#E91E63',
  Dragon: '#673AB7',
  Colorless: '#9E9E9E',
};

// Type gradient classes for badges
export const TYPE_GRADIENTS: Record<PokemonType, string> = {
  Grass: 'from-green-500 to-green-600',
  Fire: 'from-red-500 to-orange-600',
  Water: 'from-blue-500 to-blue-600',
  Lightning: 'from-yellow-400 to-yellow-500',
  Psychic: 'from-purple-500 to-pink-500',
  Fighting: 'from-orange-600 to-red-600',
  Darkness: 'from-gray-700 to-gray-900',
  Metal: 'from-gray-400 to-gray-600',
  Fairy: 'from-pink-400 to-pink-600',
  Dragon: 'from-indigo-600 to-purple-600',
  Colorless: 'from-gray-300 to-gray-400',
};

// Rarity Colors
export const RARITY_COLORS: Partial<Record<CardRarity, string>> = {
  'Common': '#616161',
  'Uncommon': '#43A047',
  'Rare': '#1976D2',
  'Rare Holo': '#7B1FA2',
  'Rare Ultra': '#FF6F00',
  'Rare Secret': '#E91E63',
  'Rare Rainbow': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
  'Rare Holo V': '#D32F2F',
  'Rare Holo VMAX': '#C62828',
  'Rare Holo VSTAR': '#FFD700',
  'Promo': '#00ACC1',
};

// Sort Options for Card Lists
export const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: '-price', label: 'Price (High to Low)' },
  { value: 'hp', label: 'HP (Low to High)' },
  { value: '-hp', label: 'HP (High to Low)' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'set', label: 'Set' },
] as const;

// Condition Options
export const CONDITION_OPTIONS = [
  { value: 'MINT', label: 'Mint', description: 'Perfect condition' },
  { value: 'NEAR_MINT', label: 'Near Mint', description: 'Minimal wear' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played', description: 'Light wear' },
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played', description: 'Moderate wear' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played', description: 'Heavy wear' },
  { value: 'DAMAGED', label: 'Damaged', description: 'Significant damage' },
] as const;

// Language Options
export const LANGUAGE_OPTIONS = [
  { value: 'EN', label: 'English' },
  { value: 'JP', label: 'Japanese' },
  { value: 'FR', label: 'French' },
  { value: 'DE', label: 'German' },
  { value: 'IT', label: 'Italian' },
  { value: 'ES', label: 'Spanish' },
  { value: 'PT', label: 'Portuguese' },
  { value: 'KO', label: 'Korean' },
  { value: 'ZH', label: 'Chinese' },
] as const;

// Page Size Options
export const PAGE_SIZE_OPTIONS = [20, 40, 60, 100] as const;

// API Endpoints
export const API_ROUTES = {
  cards: '/api/cards',
  collections: '/api/collections',
  decks: '/api/decks',
  users: '/api/users',
  auth: '/api/auth',
} as const;