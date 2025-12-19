import apiClient from './client';
import type { Order, OrderItem } from '../types';

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },

  getOne: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  create: async (orderData: { customerId: number; notes?: string }): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders', orderData);
    return data;
  },

  addItem: async (
    orderId: number,
    itemData: { productId: number; quantity: number }
  ): Promise<OrderItem> => {
    const { data } = await apiClient.post<OrderItem>(`/orders/${orderId}/items`, itemData);
    return data;
  },

  updateStatus: async (
    orderId: number,
    status: string
  ): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status });
    return data;
  },

  getTotal: async (orderId: number): Promise<{ total: number }> => {
    const { data } = await apiClient.get<{ total: number }>(`/orders/${orderId}/total`);
    return data;
  },
};
