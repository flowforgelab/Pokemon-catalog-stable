// Collection API utility functions

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { cards: number };
  totalValue?: number;
  totalCards?: number;
  uniqueCards?: number;
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  cardId: string;
  quantity: number;
  condition: string;
  language: string;
  notes?: string | null;
  card?: any;
}

export const collectionsApi = {
  // Get all user collections
  async getCollections(): Promise<Collection[]> {
    const response = await fetch('/api/collections');
    if (!response.ok) throw new Error('Failed to fetch collections');
    return response.json();
  },

  // Get a single collection
  async getCollection(id: string): Promise<Collection> {
    const response = await fetch(`/api/collections/${id}`);
    if (!response.ok) throw new Error('Failed to fetch collection');
    return response.json();
  },

  // Create a new collection
  async createCollection(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Collection> {
    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create collection');
    return response.json();
  },

  // Update a collection
  async updateCollection(
    id: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    }
  ): Promise<Collection> {
    const response = await fetch(`/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update collection');
    return response.json();
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    const response = await fetch(`/api/collections/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete collection');
  },

  // Add a card to a collection
  async addCard(
    collectionId: string,
    data: {
      cardId: string;
      quantity?: number;
      condition?: string;
      language?: string;
      notes?: string;
    }
  ): Promise<CollectionCard> {
    const response = await fetch(`/api/collections/${collectionId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add card to collection');
    return response.json();
  },

  // Update a card in a collection
  async updateCard(
    collectionId: string,
    data: {
      cardId: string;
      quantity?: number;
      condition?: string;
      language?: string;
      notes?: string;
    }
  ): Promise<CollectionCard> {
    const response = await fetch(`/api/collections/${collectionId}/cards`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update card in collection');
    return response.json();
  },

  // Remove a card from a collection
  async removeCard(
    collectionId: string,
    cardId: string,
    condition: string = 'NM',
    language: string = 'EN'
  ): Promise<void> {
    const params = new URLSearchParams({
      cardId,
      condition,
      language,
    });
    const response = await fetch(`/api/collections/${collectionId}/cards?${params}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove card from collection');
  },

  // Get public collections
  async getPublicCollections(params?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    collections: Collection[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);

    const response = await fetch(`/api/collections/public?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch public collections');
    return response.json();
  },
};

// Card conditions
export const CARD_CONDITIONS = [
  { value: 'M', label: 'Mint' },
  { value: 'NM', label: 'Near Mint' },
  { value: 'LP', label: 'Lightly Played' },
  { value: 'MP', label: 'Moderately Played' },
  { value: 'HP', label: 'Heavily Played' },
  { value: 'D', label: 'Damaged' },
];

// Card languages
export const CARD_LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'JP', label: 'Japanese' },
  { value: 'FR', label: 'French' },
  { value: 'DE', label: 'German' },
  { value: 'IT', label: 'Italian' },
  { value: 'ES', label: 'Spanish' },
  { value: 'PT', label: 'Portuguese' },
  { value: 'KO', label: 'Korean' },
  { value: 'ZH', label: 'Chinese' },
];