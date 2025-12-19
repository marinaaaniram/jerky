import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authAPI } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (allowedRoles: string[]) => boolean;
  canEdit: () => boolean;
  canManageStock: () => boolean;
  canChangeStatus: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login({ email, password });

          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));

          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      hasPermission: (allowedRoles: string[]) => {
        const { user } = get();
        if (!user) return false;
        return allowedRoles.includes(user.role.name);
      },

      canEdit: () => {
        const { hasPermission } = get();
        return hasPermission(['Руководитель', 'Менеджер по продажам']);
      },

      canManageStock: () => {
        const { hasPermission } = get();
        return hasPermission(['Руководитель', 'Кладовщик']);
      },

      canChangeStatus: () => {
        const { hasPermission } = get();
        return hasPermission(['Руководитель', 'Кладовщик', 'Курьер']);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
