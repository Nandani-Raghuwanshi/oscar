import { create } from 'zustand';
import { authAPI } from '../api/client';
import { saveToStorage, loadFromStorage, removeFromStorage, clearAllStorage } from './storageUtils';

export const useAuthStore = create((set, get) => ({
    // Initial state from localStorage
    user: loadFromStorage('auth_user', null),
    token: loadFromStorage('auth_token', null),
    isLoading: false,
    error: null,

    login: async (loginId, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.login({ loginId, password });
            const { user, token } = response.data;

            // Save to localStorage
            saveToStorage('auth_user', user);
            saveToStorage('auth_token', token);

            set({ user, token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.register(userData);
            const { user, token } = response.data;

            // Save to localStorage
            saveToStorage('auth_user', user);
            saveToStorage('auth_token', token);

            set({ user, token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    logout: () => {
        // Clear auth data from localStorage
        removeFromStorage('auth_user');
        removeFromStorage('auth_token');
        set({ user: null, token: null, error: null });
    },

    setUser: (user) => {
        set({ user });
        if (user) {
            saveToStorage('auth_user', user);
        }
    },

    updateUserProfile: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
        saveToStorage('auth_user', updatedUser);
    },

    setError: (error) => set({ error }),

    // Clear all auth storage
    clearAuthStorage: () => {
        removeFromStorage('auth_user');
        removeFromStorage('auth_token');
        set({ user: null, token: null });
    },
}));
