import { create } from 'zustand';
import type { ICart, ICartItemAdd, ICartItemUpdate } from '@wine-order-app/shared-types';
import { api } from '../api/client';

interface CartState {
  cart: ICart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (input: ICartItemAdd) => Promise<void>;
  updateItem: (itemId: string, input: ICartItemUpdate) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.get<ICart>('/cart');
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.post<ICart>('/cart/items', input);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateItem: async (itemId, input) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.patch<ICart>(`/cart/items/${itemId}`, input);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.delete<ICart>(`/cart/items/${itemId}`);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      await api.delete<void>('/cart');
      set({ cart: { items: [], totalPrice: 0 } });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
