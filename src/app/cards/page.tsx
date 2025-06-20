"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { Button } from "@/components/ui/button";
import { Card, CardsResponse } from "@/lib/types/index";
import { CardsFilter } from "@/components/cards-filter";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Search } from "lucide-react";

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [totalPages, setTotalPages] = useState(1);
  
  const page = parseInt(searchParams.get('page') || '1');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams(searchParams.toString());
        
        // Update search param with debounced value
        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        } else {
          params.delete('search');
        }
        
        const response = await fetch(`/api/cards?${params}`);
        if (!response.ok) throw new Error('Failed to fetch cards');
        
        const data: CardsResponse = await response.json();
        
        setCards(data.cards || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
        setError(error instanceof Error ? error.message : 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [searchParams, debouncedSearch]);
  
  // Update URL when search changes
  useEffect(() => {
    if (debouncedSearch !== searchParams.get('search')) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/cards?${params.toString()}`);
    }
  }, [debouncedSearch, searchParams, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/cards?${params.toString()}`);
  };

  if (loading && cards.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Pokemon Cards</h1>
        <div className="flex gap-6">
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="space-y-4">
              <SkeletonCard />
            </div>
          </aside>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(20)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pokemon Cards</h1>
        <div className="flex gap-4 items-center">
          <Input
            type="search"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={handleSearch}
            className="max-w-md"
          />
          <MobileFilterSheet />
        </div>
      </div>
      
      <div className="flex gap-6">
        <aside className="w-64 shrink-0 hidden lg:block">
          <CardsFilter />
        </aside>
        
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <PokemonCard 
                key={card.id} 
                id={card.pokemonTcgId}
                name={card.name}
                image={card.imageSmall}
                types={card.types}
                hp={card.hp ? parseInt(card.hp) : undefined}
                rarity={card.rarity || undefined}
                price={card.marketPrice || undefined}
                tcgplayerUrl={card.tcgplayerUrl || undefined}
              />
            ))}
          </div>
          
          {error && !loading && (
            <ErrorState 
              retry={() => window.location.reload()}
              className="col-span-full py-12"
            />
          )}
          
          {!error && cards.length === 0 && !loading && (
            <EmptyState 
              icon={<Search className="h-12 w-12" />}
              title="No cards found"
              description="Try adjusting your filters or search term"
              className="col-span-full py-12"
            />
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}