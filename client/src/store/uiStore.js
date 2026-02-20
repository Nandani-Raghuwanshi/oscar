import { create } from 'zustand';
import { saveToStorage, loadFromStorage, removeFromStorage } from './storageUtils';

/**
 * UI Store for managing UI preferences and state
 * Persists to localStorage for consistency across sessions
 */
export const useUIStore = create((set, get) => ({
    // Sidebar state
    sidebarOpen: loadFromStorage('ui_sidebarOpen', true),

    // Theme preferences
    darkMode: loadFromStorage('ui_darkMode', false),

    // Filters and preferences
    defaultPageSize: loadFromStorage('ui_defaultPageSize', 20),
    defaultSortOrder: loadFromStorage('ui_defaultSortOrder', 'desc'),

    // Modal states (not persisted - reset on page reload)
    activeModals: new Set(),

    // Sidebar toggle
    toggleSidebar: () => {
        const newState = !get().sidebarOpen;
        set({ sidebarOpen: newState });
        saveToStorage('ui_sidebarOpen', newState);
    },

    // Theme toggle
    toggleDarkMode: () => {
        const newState = !get().darkMode;
        set({ darkMode: newState });
        saveToStorage('ui_darkMode', newState);
    },

    // Set preferences
    setDefaultPageSize: (size) => {
        set({ defaultPageSize: size });
        saveToStorage('ui_defaultPageSize', size);
    },

    setDefaultSortOrder: (order) => {
        set({ defaultSortOrder: order });
        saveToStorage('ui_defaultSortOrder', order);
    },

    // Modal management
    openModal: (modalId) => {
        const modals = new Set(get().activeModals);
        modals.add(modalId);
        set({ activeModals: modals });
    },

    closeModal: (modalId) => {
        const modals = new Set(get().activeModals);
        modals.delete(modalId);
        set({ activeModals: modals });
    },

    // Clear UI preferences
    resetPreferences: () => {
        removeFromStorage('ui_sidebarOpen');
        removeFromStorage('ui_darkMode');
        removeFromStorage('ui_defaultPageSize');
        removeFromStorage('ui_defaultSortOrder');
        set({
            sidebarOpen: true,
            darkMode: false,
            defaultPageSize: 20,
            defaultSortOrder: 'desc',
            activeModals: new Set(),
        });
    },
}));
