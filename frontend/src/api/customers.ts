import apiClient from './client';
import type { Customer } from '../types';

export const customersAPI = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers', {
      params: { includeArchived: true },
    });
    return data;
  },

  getOne: async (id: number): Promise<Customer> => {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },

  create: async (createData: { name: string; address?: string; phone?: string; paymentType: 'прямые' | 'реализация' }): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>('/customers', createData);
    return data;
  },

  update: async (id: number, updateData: { name?: string; address?: string; phone?: string; paymentType?: 'прямые' | 'реализация' }): Promise<Customer> => {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, updateData);
    return data;
  },

  archive: async (id: number): Promise<Customer> => {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}/archive`);
    return data;
  },
};
