"use client";

import { useEffect, useState } from "react";
import { PokemonCard } from "@/components/pokemon-card";
import { PokemonCard as PokemonCardType } from "@/lib/types";

export default function CardsPage() {
  const [cards, setCards] = useState<PokemonCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch("/api/cards");
        const data = await response.json();
        setCards(data.cards);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Pokemon Cards</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Pokemon Cards</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <PokemonCard key={card.id} card={card} />
        ))}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cards found.</p>
        </div>
      )}
    </div>
  );
}