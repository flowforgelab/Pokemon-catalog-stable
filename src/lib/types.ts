export interface PokemonCard {
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
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
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
  condition: string;
  language: string;
  notes: string | null;
  card?: PokemonCard;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  format: string;
  description: string | null;
  isPublic: boolean;
  cards?: DeckCard[];
  _count?: {
    cards: number;
  };
}

export interface DeckCard {
  id: string;
  deckId: string;
  cardId: string;
  quantity: number;
  card?: PokemonCard;
}