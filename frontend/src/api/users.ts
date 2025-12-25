import apiClient from './client';
import type { User, Role } from '../types';

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  getOne: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  create: async (createData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: number;
  }): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', createData);
    return data;
  },

  update: async (
    id: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      roleId?: number;
      isActive?: boolean;
    }
  ): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, updateData);
    return data;
  },

  deactivate: async (id: number): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}/deactivate`);
    return data;
  },

  activate: async (id: number): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}/activate`);
    return data;
  },
};

export const rolesAPI = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>('/roles');
    return data;
  },
};

