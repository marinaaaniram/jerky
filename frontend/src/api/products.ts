import apiClient from './client';
import type { Product } from '../types';

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
  },

  getOne: async (id: number): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
};
