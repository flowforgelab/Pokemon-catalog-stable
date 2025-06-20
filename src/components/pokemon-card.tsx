"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PokemonCard as PokemonCardType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PokemonCardProps {
  card: PokemonCardType;
  className?: string;
}

const typeColors: Record<string, string> = {
  Colorless: "bg-gray-200 text-gray-800",
  Fighting: "bg-red-600 text-white",
  Fire: "bg-orange-500 text-white",
  Grass: "bg-green-500 text-white",
  Lightning: "bg-yellow-400 text-gray-900",
  Psychic: "bg-purple-500 text-white",
  Water: "bg-blue-500 text-white",
  Darkness: "bg-gray-800 text-white",
  Dragon: "bg-indigo-600 text-white",
  Fairy: "bg-pink-400 text-white",
  Metal: "bg-gray-500 text-white",
};

export function PokemonCard({ card, className }: PokemonCardProps) {
  return (
    <Card className={cn("group hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="relative aspect-[63/88] mb-3">
          <Image
            src={card.imageLarge || card.imageSmall}
            alt={card.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <h3 className="font-semibold text-lg truncate">{card.name}</h3>
        
        <div className="flex items-center gap-2 mt-2">
          {card.types?.map((type) => (
            <span
              key={type}
              className={cn(
                "px-2 py-1 text-xs rounded",
                typeColors[type] || "bg-gray-200 text-gray-800"
              )}
            >
              {type}
            </span>
          ))}
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <p>{card.setName}</p>
          <p>#{card.number}/{card.setTotal}</p>
          {card.rarity && <p className="capitalize">{card.rarity}</p>}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="w-full">
          {card.marketPrice && (
            <p className="text-lg font-bold">${card.marketPrice.toFixed(2)}</p>
          )}
          {card.tcgplayerUrl && (
            <Link
              href={card.tcgplayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Buy on TCGPlayer
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}