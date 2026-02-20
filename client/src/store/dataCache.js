import { create } from 'zustand';
import { saveToStorage, loadFromStorage, removeFromStorage } from './storageUtils';

/**
 * Data Cache Store for caching API responses
 * Reduces unnecessary API calls by persisting fetched data
 */
export const useDataCacheStore = create((set, get) => ({
    // Cache storage
    cache: loadFromStorage('data_cache', {}),
    cacheTimestamps: loadFromStorage('data_cache_timestamps', {}),

    // Cache TTL in milliseconds (1 hour by default)
    CACHE_TTL: 60 * 60 * 1000,

    /**
     * Get cached data if available and not expired
     */
    getCachedData: (key) => {
        const cache = get().cache;
        const timestamps = get().cacheTimestamps;
        const now = Date.now();

        if (key in cache && key in timestamps) {
            const timestamp = timestamps[key];
            // Check if cache is still valid (not expired)
            if (now - timestamp < get().CACHE_TTL) {
                console.log(`[DataCache] Cache hit for key: ${key}`);
                return cache[key];
            } else {
                console.log(`[DataCache] Cache expired for key: ${key}`);
                // Remove expired cache
                get().removeCachedData(key);
            }
        }
        return null;
    },

    /**
     * Set cached data with timestamp
     */
    setCachedData: (key, data) => {
        const cache = { ...get().cache };
        const timestamps = { ...get().cacheTimestamps };

        cache[key] = data;
        timestamps[key] = Date.now();

        set({ cache, cacheTimestamps: timestamps });
        saveToStorage('data_cache', cache);
        saveToStorage('data_cache_timestamps', timestamps);
        console.log(`[DataCache] Cached data for key: ${key}`);
    },

    /**
     * Remove specific cached data
     */
    removeCachedData: (key) => {
        const cache = { ...get().cache };
        const timestamps = { ...get().cacheTimestamps };

        delete cache[key];
        delete timestamps[key];

        set({ cache, cacheTimestamps: timestamps });
        saveToStorage('data_cache', cache);
        saveToStorage('data_cache_timestamps', timestamps);
        console.log(`[DataCache] Removed cache for key: ${key}`);
    },

    /**
     * Clear all cached data
     */
    clearAllCache: () => {
        set({ cache: {}, cacheTimestamps: {} });
        removeFromStorage('data_cache');
        removeFromStorage('data_cache_timestamps');
        console.log('[DataCache] Cleared all cache');
    },

    /**
     * Clear cache by pattern (e.g., 'customer_*' clears all customer-related cache)
     */
    clearCacheByPattern: (pattern) => {
        const cache = { ...get().cache };
        const timestamps = { ...get().cacheTimestamps };
        const regex = new RegExp(pattern);

        Object.keys(cache).forEach(key => {
            if (regex.test(key)) {
                delete cache[key];
                delete timestamps[key];
            }
        });

        set({ cache, cacheTimestamps: timestamps });
        saveToStorage('data_cache', cache);
        saveToStorage('data_cache_timestamps', timestamps);
        console.log(`[DataCache] Cleared cache matching pattern: ${pattern}`);
    },

    /**
     * Get cache statistics
     */
    getCacheStats: () => {
        const cache = get().cache;
        const timestamps = get().cacheTimestamps;
        const now = Date.now();
        const ttl = get().CACHE_TTL;

        let validCount = 0;
        let expiredCount = 0;

        Object.keys(cache).forEach(key => {
            if (key in timestamps) {
                if (now - timestamps[key] < ttl) {
                    validCount++;
                } else {
                    expiredCount++;
                }
            }
        });

        return {
            totalKeys: Object.keys(cache).length,
            validCount,
            expiredCount,
            cacheTTL: ttl,
        };
    },
}));
