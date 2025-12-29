import apiClient from './client';
import type { Order, OrderItem } from '../types';

// Transform API response to ensure numeric prices
const transformOrderItem = (item: any): OrderItem => ({
  ...item,
  price: Number(item.price),
});

const transformOrder = (order: any): Order => ({
  ...order,
  orderItems: order.orderItems?.map(transformOrderItem) || [],
});

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<any[]>('/orders');
    return data.map(transformOrder);
  },

  getOne: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get<any>(`/orders/${id}`);
    return transformOrder(data);
  },

  create: async (orderData: { customerId: number; notes?: string }): Promise<Order> => {
    const { data } = await apiClient.post<any>('/orders', orderData);
    return transformOrder(data);
  },

  addItem: async (
    orderId: number,
    itemData: { productId: number; quantity: number }
  ): Promise<OrderItem> => {
    const { data } = await apiClient.post<any>(`/orders/${orderId}/items`, itemData);
    return transformOrderItem(data);
  },

  updateStatus: async (
    orderId: number,
    status: string
  ): Promise<Order> => {
    const { data } = await apiClient.patch<any>(`/orders/${orderId}/status`, { status });
    return transformOrder(data);
  },

  getTotal: async (orderId: number): Promise<{ total: number }> => {
    const { data } = await apiClient.get<any>(`/orders/${orderId}/total`);
    return {
      total: Number(data.total),
    };
  },

  assignCourier: async (
    orderId: number,
    userId: number
  ): Promise<Order> => {
    const { data } = await apiClient.patch<any>(`/orders/${orderId}/assign-courier`, { userId });
    return transformOrder(data);
  },
};
