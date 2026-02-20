/**
 * Storage Utility Functions for Zustand Stores
 * Provides consistent localStorage persistence across all stores
 */

const STORAGE_PREFIX = 'oscar_app_';

/**
 * Save an item to localStorage
 * @param {string} key - Storage key name
 * @param {any} value - Value to store
 */
export const saveToStorage = (key, value) => {
    try {
        const prefixedKey = `${STORAGE_PREFIX}${key}`;
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(prefixedKey, serialized);
        console.log(`[Storage] Saved: ${prefixedKey}`);
    } catch (error) {
        console.error(`[Storage] Error saving ${key}:`, error);
    }
};

/**
 * Load an item from localStorage
 * @param {string} key - Storage key name
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or defaultValue
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const prefixedKey = `${STORAGE_PREFIX}${key}`;
        const stored = localStorage.getItem(prefixedKey);
        if (stored === null) {
            return defaultValue;
        }
        try {
            const parsed = JSON.parse(stored);
            console.log(`[Storage] Loaded: ${prefixedKey}`, parsed);
            return parsed;
        } catch {
            // If JSON parse fails, return as string
            console.log(`[Storage] Loaded: ${prefixedKey} (string)`);
            return stored;
        }
    } catch (error) {
        console.error(`[Storage] Error loading ${key}:`, error);
        return defaultValue;
    }
};

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key name
 */
export const removeFromStorage = (key) => {
    try {
        const prefixedKey = `${STORAGE_PREFIX}${key}`;
        localStorage.removeItem(prefixedKey);
        console.log(`[Storage] Removed: ${prefixedKey}`);
    } catch (error) {
        console.error(`[Storage] Error removing ${key}:`, error);
    }
};

/**
 * Clear all app-specific storage
 */
export const clearAllStorage = () => {
    try {
        const keys = Object.keys(localStorage).filter(key =>
            key.startsWith(STORAGE_PREFIX)
        );
        keys.forEach(key => localStorage.removeItem(key));
        console.log(`[Storage] Cleared ${keys.length} items`);
    } catch (error) {
        console.error('[Storage] Error clearing storage:', error);
    }
};

/**
 * Create a persistent middleware for Zustand stores
 * Automatically saves state to localStorage and restores on load
 * @param {string} storeName - Name of the store (for storage keys)
 * @param {Array<string>} persistKeys - Keys to persist from the state
 * @returns {function} Middleware function for Zustand
 */
export const createPersistMiddleware = (storeName, persistKeys = []) => (
    config
) => (set, get, api) => {
    // Load initial state from localStorage
    const storedState = loadFromStorage(storeName, {});

    // Create initial state with localStorage values merged
    const initialState = {
        ...config(set, get, api),
        ...storedState,
    };

    // Custom set function that also saves to localStorage
    const persistentSet = (state) => {
        set(state);
        // After state update, save relevant keys to storage
        const newState = typeof state === 'function' ? state(get()) : state;
        const stateToSave = persistKeys.length > 0
            ? persistKeys.reduce((acc, key) => {
                if (key in newState) {
                    acc[key] = newState[key];
                }
                return acc;
            }, {})
            : newState;
        if (Object.keys(stateToSave).length > 0) {
            saveToStorage(storeName, { ...storedState, ...stateToSave });
        }
    };

    return {
        ...initialState,
        // Methods to manage storage
        _clearStorage: () => {
            removeFromStorage(storeName);
        },
        _saveToStorage: () => {
            const state = get();
            const stateToSave = persistKeys.length > 0
                ? persistKeys.reduce((acc, key) => {
                    if (key in state) {
                        acc[key] = state[key];
                    }
                    return acc;
                }, {})
                : state;
            saveToStorage(storeName, stateToSave);
        },
    };
};
