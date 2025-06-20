import { NextRequest, NextResponse } from "next/server";

// Mock data for now - will connect to real database later
const mockCards = [
  {
    id: "1",
    pokemonTcgId: "base1-4",
    name: "Charizard",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    types: ["Fire"],
    hp: "120",
    number: "4",
    artist: "Mitsuhiro Arita",
    rarity: "Rare Holo",
    setId: "base1",
    setName: "Base Set",
    setSeries: "Base",
    setTotal: 102,
    imageSmall: "https://images.pokemontcg.io/base1/4.png",
    imageLarge: "https://images.pokemontcg.io/base1/4_hires.png",
    marketPrice: 425.99,
    tcgplayerUrl: "https://www.tcgplayer.com/product/42378",
  },
  {
    id: "2",
    pokemonTcgId: "base1-58",
    name: "Pikachu",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Lightning"],
    hp: "40",
    number: "58",
    artist: "Mitsuhiro Arita",
    rarity: "Common",
    setId: "base1",
    setName: "Base Set",
    setSeries: "Base",
    setTotal: 102,
    imageSmall: "https://images.pokemontcg.io/base1/58.png",
    imageLarge: "https://images.pokemontcg.io/base1/58_hires.png",
    marketPrice: 8.99,
    tcgplayerUrl: "https://www.tcgplayer.com/product/42432",
  },
  {
    id: "3",
    pokemonTcgId: "base1-6",
    name: "Gyarados",
    supertype: "Pokémon",
    subtypes: ["Stage 1"],
    types: ["Water"],
    hp: "100",
    number: "6",
    artist: "Mitsuhiro Arita",
    rarity: "Rare Holo",
    setId: "base1",
    setName: "Base Set",
    setSeries: "Base",
    setTotal: 102,
    imageSmall: "https://images.pokemontcg.io/base1/6.png",
    imageLarge: "https://images.pokemontcg.io/base1/6_hires.png",
    marketPrice: 45.99,
    tcgplayerUrl: "https://www.tcgplayer.com/product/42380",
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would query the database
    return NextResponse.json({
      cards: mockCards,
      total: mockCards.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}