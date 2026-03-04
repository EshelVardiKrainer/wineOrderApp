import { create } from 'zustand';
import type { IUser } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import type { IAuthResponse } from '@wine-order-app/shared-types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  googleLogin: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<IAuthResponse>('/auth/google', { idToken });
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      set({ user: res.user, token: res.accessToken, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as IUser;
        set({ user, token });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));
