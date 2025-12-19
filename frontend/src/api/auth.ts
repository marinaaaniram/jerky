import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data} = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  },
};
