import { useState, useEffect } from 'react';
import { Card, CardsResponse, SearchFilters } from '@/lib/types';

interface UseCardsOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: SearchFilters;
}

interface UseCardsResult {
  cards: Card[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
}

export function useCards(options: UseCardsOptions = {}): UseCardsResult {
  const { page = 1, limit = 20, search = '', filters = {} } = options;
  
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(filters.types?.length && { type: filters.types.join(',') }),
        ...(filters.rarities?.length && { rarity: filters.rarities.join(',') }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });
      
      const response = await fetch(`/api/cards?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.statusText}`);
      }
      
      const data: CardsResponse = await response.json();
      
      setCards(data.cards);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [page, limit, search, JSON.stringify(filters)]);

  return {
    cards,
    loading,
    error,
    pagination,
    refetch: fetchCards,
  };
}