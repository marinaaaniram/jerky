import apiClient from './client';
import type { Customer } from '../types';

export const customersAPI = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers');
    return data;
  },

  getOne: async (id: number): Promise<Customer> => {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },
};
