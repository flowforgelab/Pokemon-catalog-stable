// Core Card Types
export interface Card {
  id: string;
  pokemonTcgId: string;
  name: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  hp: string | null;
  number: string;
  artist: string | null;
  rarity: string | null;
  setId: string;
  setName: string;
  setSeries: string;
  setTotal: number;
  imageSmall: string;
  imageLarge: string;
  marketPrice: number | null;
  tcgplayerUrl: string | null;
  
  // Game mechanics
  evolvesFrom: string | null;
  evolvesTo: string[];
  retreatCost: number | null;
  regulationMark: string | null;
  rules: string[];
  flavorText: string | null;
  
  // Legalities
  standardLegal: boolean;
  expandedLegal: boolean;
  unlimitedLegal: boolean;
  
  // Relations
  attacks?: Attack[];
  abilities?: Ability[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Game Mechanic Types
export interface Attack {
  id: string;
  cardId: string;
  name: string;
  cost: string[];
  damage: string | null;
  text: string | null;
  convertedEnergyCost: number;
}

export interface Ability {
  id: string;
  cardId: string;
  name: string;
  type: string;
  text: string;
}

export interface Weakness {
  id: string;
  cardId: string;
  type: string;
  value: string;
}

export interface Resistance {
  id: string;
  cardId: string;
  type: string;
  value: string;
}

// API Response Types
export interface CardsResponse {
  cards: Card[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search & Filter Types
export interface SearchFilters {
  search?: string;
  types?: string[];
  rarities?: string[];
  sets?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'hp' | 'rarity' | 'set';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchInput {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

// Collection Types
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  cards?: CollectionCard[];
  _count?: {
    cards: number;
  };
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  cardId: string;
  quantity: number;
  condition: CardCondition;
  language: string;
  isFirstEdition: boolean;
  isFoil: boolean;
  notes: string | null;
  purchasePrice: number | null;
  createdAt: Date;
  updatedAt: Date;
  card?: Card;
}

export enum CardCondition {
  MINT = 'MINT',
  NEAR_MINT = 'NEAR_MINT',
  LIGHTLY_PLAYED = 'LIGHTLY_PLAYED',
  MODERATELY_PLAYED = 'MODERATELY_PLAYED',
  HEAVILY_PLAYED = 'HEAVILY_PLAYED',
  DAMAGED = 'DAMAGED'
}

// Deck Types
export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  format: DeckFormat;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  cards?: DeckCard[];
  analysis?: DeckAnalysis | null;
  _count?: {
    cards: number;
  };
}

export interface DeckCard {
  id: string;
  deckId: string;
  cardId: string;
  quantity: number;
  card?: Card;
}

export enum DeckFormat {
  STANDARD = 'STANDARD',
  EXPANDED = 'EXPANDED',
  UNLIMITED = 'UNLIMITED'
}

export interface DeckAnalysis {
  id: string;
  deckId: string;
  consistencyScore: number;
  speedScore: number;
  resilienceScore: number;
  synergyScore: number;
  metaScore: number;
  overallScore: number;
  strategy: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  energyCurve: any;
  typeDistribution: any;
  trainerRatios: any;
  attackCosts: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeckStrategy {
  AGGRO = 'AGGRO',
  CONTROL = 'CONTROL',
  COMBO = 'COMBO',
  MIDRANGE = 'MIDRANGE',
  STALL = 'STALL'
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  collections?: Collection[];
  decks?: Deck[];
  followers?: UserFollow[];
  following?: UserFollow[];
  _count?: {
    collections: number;
    decks: number;
    followers: number;
    following: number;
  };
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: User;
  following?: User;
}

// Input Types for API calls
export interface CreateCollectionInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddCardToCollectionInput {
  cardId: string;
  quantity?: number;
  condition?: CardCondition;
  language?: string;
  isFirstEdition?: boolean;
  isFoil?: boolean;
  notes?: string;
  purchasePrice?: number;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
  format: DeckFormat;
  isPublic?: boolean;
}

export interface UpdateDeckInput {
  name?: string;
  description?: string;
  format?: DeckFormat;
  isPublic?: boolean;
}

export interface AddCardToDeckInput {
  cardId: string;
  quantity: number;
}

// Utility Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Price History Types
export interface PriceHistory {
  id: string;
  cardId: string;
  marketPrice: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  source: string;
  recordedAt: Date;
}

// Stats Types
export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  valueChange24h: number;
  valueChange7d: number;
  mostValuableCard?: Card;
  newestCard?: Card;
}

export interface DeckStats {
  totalCards: number;
  pokemonCount: number;
  trainerCount: number;
  energyCount: number;
  averageHp: number;
  typeDistribution: Record<string, number>;
  legalFormats: DeckFormat[];
}

// Constants
export const POKEMON_TYPES = [
  'Grass',
  'Fire',
  'Water',
  'Lightning',
  'Psychic',
  'Fighting',
  'Darkness',
  'Metal',
  'Fairy',
  'Dragon',
  'Colorless'
] as const;

export const CARD_RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Ultra',
  'Rare Secret',
  'Rare Rainbow',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Holo VSTAR',
  'Promo',
  'Unknown'
] as const;

export const ANIME_ERAS = [
  'Original Series',
  'Advanced Generation',
  'Diamond & Pearl',
  'Black & White',
  'XY Series',
  'Sun & Moon',
  'Journeys',
  'Horizons'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];
export type CardRarity = typeof CARD_RARITIES[number];
export type AnimeEra = typeof ANIME_ERAS[number];