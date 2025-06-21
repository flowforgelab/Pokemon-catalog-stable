"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, Copy, ArrowRight } from "lucide-react"
import { DeckBuilder } from "@/lib/ai/deck-builder"
import { Card as CardType } from "@/lib/types"

export default function BuildAroundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CardType[]>([])
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [deckSkeleton, setDeckSkeleton] = useState<any>(null)
  const [searching, setSearching] = useState(false)

  const searchCards = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const res = await fetch(`/api/cards?search=${encodeURIComponent(searchQuery)}&limit=12`);
      const data = await res.json();
      setSearchResults(data.cards.filter((c: CardType) => c.supertype === 'Pokémon'));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const buildDeck = async () => {
    if (!selectedCard) return;

    // Get more cards for synergy finding
    const res = await fetch('/api/cards?limit=500');
    const data = await res.json();
    
    const builder = new DeckBuilder();
    const skeleton = builder.buildAround(selectedCard, data.cards);
    setDeckSkeleton(skeleton);
  };

  const copyDeckList = () => {
    if (!deckSkeleton || !selectedCard) return;
    
    const list = [
      `// ${selectedCard.name} ${deckSkeleton.strategy} Deck`,
      '',
      'Pokemon:',
      `4 ${selectedCard.name} ${selectedCard.number}`,
      ...deckSkeleton.support.slice(0, 4).map((c: CardType) => 
        `2 ${c.name} ${c.number}`
      ),
      '',
      'Trainers:',
      ...deckSkeleton.trainers,
      '',
      'Energy:',
      ...deckSkeleton.energy
    ].join('\n');
    
    navigator.clipboard.writeText(list);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Build-Around-Card</h1>
        <p className="text-muted-foreground">
          Select a card and AI will create an optimized deck around it
        </p>
      </div>

      {/* Search Section */}
      <Card className="p-6 mb-8">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a Pokemon card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCards()}
            className="flex-1"
          />
          <Button onClick={searchCards} disabled={searching}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {searchResults.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  setSelectedCard(card);
                  setDeckSkeleton(null);
                }}
                className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                  selectedCard?.id === card.id 
                    ? 'ring-2 ring-primary' 
                    : 'hover:shadow-lg'
                }`}
              >
                <img 
                  src={card.imageSmall} 
                  alt={card.name}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Selected Card & Deck */}
      {selectedCard && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Selected Card Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Card</h2>
            <div className="flex gap-4">
              <img 
                src={selectedCard.imageSmall} 
                alt={selectedCard.name}
                className="w-32 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium">{selectedCard.name}</h3>
                <div className="flex gap-2 mt-2">
                  {selectedCard.types.map(type => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
                {selectedCard.hp && (
                  <p className="text-sm text-muted-foreground mt-2">HP: {selectedCard.hp}</p>
                )}
                <Button 
                  onClick={buildDeck} 
                  className="mt-4 w-full"
                  disabled={!selectedCard}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Deck
                </Button>
              </div>
            </div>
          </Card>

          {/* Generated Deck */}
          {deckSkeleton && (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Generated Deck</h2>
                  <Badge className="mt-1">{deckSkeleton.strategy}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyDeckList}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="space-y-4">
                {/* Core Pokemon */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Core Pokemon</h3>
                  <div className="space-y-1">
                    <div className="text-sm">4x {selectedCard.name}</div>
                  </div>
                </div>

                {/* Support Pokemon */}
                {deckSkeleton.support.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Support Pokemon</h3>
                    <div className="space-y-1">
                      {deckSkeleton.support.slice(0, 4).map((card: CardType, i: number) => (
                        <div key={i} className="text-sm">
                          2x {card.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trainers */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Trainers</h3>
                  <div className="space-y-1">
                    {deckSkeleton.trainers.slice(0, 5).map((trainer: string, i: number) => (
                      <div key={i} className="text-sm">{trainer}</div>
                    ))}
                    {deckSkeleton.trainers.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        +{deckSkeleton.trainers.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Energy</h3>
                  <div className="space-y-1">
                    {deckSkeleton.energy.map((energy: string, i: number) => (
                      <div key={i} className="text-sm">{energy}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  This is a skeleton deck. Add more trainers and Pokemon to reach 60 cards.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedCard && searchResults.length === 0 && (
        <Card className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Search for a Pokemon card to build a deck around it
          </p>
        </Card>
      )}
    </div>
  )
}