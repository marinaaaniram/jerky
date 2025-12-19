import apiClient from './client';

export interface SearchResult {
  type: 'order' | 'customer' | 'product';
  id: number;
  title: string;
  description: string;
  icon?: string;
  url: string;
  // Additional fields for orders
  status?: string;
  customer?: string;
  notes?: string;
}

export const searchAPI = {
  globalSearch: async (query: string, limit: number = 10): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const response = await apiClient.get<SearchResult[]>('/search/global', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
