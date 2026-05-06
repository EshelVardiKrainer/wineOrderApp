import { create } from 'zustand';
import { api } from '../api/client';
export const useCartStore = create((set) => ({
    cart: null,
    isLoading: false,
    error: null,
    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const cart = await api.get('/cart');
            set({ cart, isLoading: false });
        }
        catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },
    addItem: async (input) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await api.post('/cart/items', input);
            set({ cart, isLoading: false });
        }
        catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },
    updateItem: async (itemId, input) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await api.patch(`/cart/items/${itemId}`, input);
            set({ cart, isLoading: false });
        }
        catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },
    removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await api.delete(`/cart/items/${itemId}`);
            set({ cart, isLoading: false });
        }
        catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },
    clearCart: async () => {
        try {
            await api.delete('/cart');
            set({ cart: { items: [], totalPrice: 0 } });
        }
        catch (err) {
            set({ error: err.message });
        }
    },
}));
//# sourceMappingURL=cart.store.js.map