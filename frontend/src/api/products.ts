import apiClient from './client';
import type { Product } from '../types';

// Transform API response to ensure numeric prices
const transformProduct = (product: any): Product => ({
  ...product,
  price: Number(product.price),
});

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<any[]>('/products');
    return data.map(transformProduct);
  },

  getOne: async (id: number): Promise<Product> => {
    const { data } = await apiClient.get<any>(`/products/${id}`);
    return transformProduct(data);
  },

  create: async (productData: { name: string; description?: string; price: number; stockQuantity?: number }): Promise<Product> => {
    const { data } = await apiClient.post<any>('/products', productData);
    return transformProduct(data);
  },

  update: async (id: number, productData: { name?: string; description?: string; price?: number; stockQuantity?: number }): Promise<Product> => {
    const { data } = await apiClient.patch<any>(`/products/${id}`, productData);
    return transformProduct(data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
