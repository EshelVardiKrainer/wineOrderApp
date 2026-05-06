import { create } from 'zustand';
import { api } from '../api/client';
export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    googleLogin: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/google', { idToken });
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('user', JSON.stringify(res.user));
            set({ user: res.user, token: res.accessToken, isLoading: false });
        }
        catch (err) {
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
                const user = JSON.parse(userStr);
                set({ user, token });
            }
            catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    },
}));
//# sourceMappingURL=auth.store.js.map