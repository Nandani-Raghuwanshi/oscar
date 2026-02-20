# localStorage & State Management Guide

This document explains how the application uses localStorage for persistent state management across all Zustand stores.

## Overview

The application uses a centralized localStorage system with the following components:

1. **storageUtils.js** - Utility functions for localStorage operations
2. **authStore.js** - Authentication state (user, token)
3. **uiStore.js** - UI preferences and state
4. **dataCache.js** - API response caching

All data is prefixed with `oscar_app_` to avoid conflicts with other applications.

## Architecture

### Storage Prefix
All localStorage keys are prefixed with `oscar_app_` for namespacing:
```
oscar_app_auth_user
oscar_app_auth_token
oscar_app_ui_sidebarOpen
oscar_app_data_cache
```

### Storage Utilities

#### `saveToStorage(key, value)`
Saves data to localStorage with automatic JSON serialization.
```javascript
import { saveToStorage } from './store/storageUtils';

saveToStorage('my_key', { foo: 'bar' });
// Stored as: oscar_app_my_key = '{"foo":"bar"}'
```

#### `loadFromStorage(key, defaultValue)`
Loads data from localStorage with automatic JSON parsing.
```javascript
import { loadFromStorage } from './store/storageUtils';

const data = loadFromStorage('my_key', null);
```

#### `removeFromStorage(key)`
Removes a specific item from localStorage.
```javascript
import { removeFromStorage } from './store/storageUtils';

removeFromStorage('my_key');
```

#### `clearAllStorage()`
Clears all app-specific storage.
```javascript
import { clearAllStorage } from './store/storageUtils';

clearAllStorage(); // Removes all oscar_app_* keys
```

## Store Reference

### Auth Store (`useAuthStore`)

Manages user authentication and profile.

**State:**
```javascript
{
  user: null,          // Current logged-in user object
  token: null,         // JWT authentication token
  isLoading: false,    // Loading state for async operations
  error: null,         // Error messages
}
```

**Methods:**
- `login(email, password)` - Login user
- `register(userData)` - Register new user
- `logout()` - Clear auth and logout
- `setUser(user)` - Update user object
- `updateUserProfile(userData)` - Merge update to user profile
- `setError(error)` - Set error message
- `clearAuthStorage()` - Clear auth localStorage

**Usage:**
```javascript
import { useAuthStore } from './store/authStore';

const MyComponent = () => {
  const { user, token, login } = useAuthStore();
  
  const handleLogin = async () => {
    const success = await login('user@example.com', 'password');
    if (success) {
      // User and token automatically saved to localStorage
    }
  };
  
  return <div>{user?.firstName}</div>;
};
```

**localStorage Keys:**
- `oscar_app_auth_user` - User profile object
- `oscar_app_auth_token` - JWT token

---

### UI Store (`useUIStore`)

Manages UI preferences and component states.

**State:**
```javascript
{
  sidebarOpen: true,
  darkMode: false,
  defaultPageSize: 20,
  defaultSortOrder: 'desc',
  activeModals: Set,  // Not persisted
}
```

**Methods:**
- `toggleSidebar()` - Toggle sidebar open/closed
- `toggleDarkMode()` - Toggle dark mode
- `setDefaultPageSize(size)` - Set pagination size
- `setDefaultSortOrder(order)` - Set sort order
- `openModal(modalId)` - Open a modal
- `closeModal(modalId)` - Close a modal
- `resetPreferences()` - Reset all UI preferences

**Usage:**
```javascript
import { useUIStore } from './store/uiStore';

const Navigation = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <button onClick={toggleSidebar}>
      {sidebarOpen ? 'Close' : 'Open'} Sidebar
    </button>
  );
};
```

**localStorage Keys:**
- `oscar_app_ui_sidebarOpen` - Sidebar state
- `oscar_app_ui_darkMode` - Dark mode preference
- `oscar_app_ui_defaultPageSize` - Default pagination size
- `oscar_app_ui_defaultSortOrder` - Default sort order

---

### Data Cache Store (`useDataCacheStore`)

Caches API responses to reduce redundant requests.

**State:**
```javascript
{
  cache: {},                    // Cached data objects
  cacheTimestamps: {},          // Timestamps for each cache entry
  CACHE_TTL: 3600000,          // Cache TTL in milliseconds (1 hour)
}
```

**Methods:**
- `getCachedData(key)` - Get cached data (returns null if expired)
- `setCachedData(key, data)` - Cache data with timestamp
- `removeCachedData(key)` - Remove specific cache entry
- `clearAllCache()` - Clear all cached data
- `clearCacheByPattern(pattern)` - Clear cache matching regex pattern
- `getCacheStats()` - Get cache statistics

**Usage:**
```javascript
import { useDataCacheStore } from './store/dataCache';

const CustomerList = () => {
  const { getCachedData, setCachedData } = useDataCacheStore();
  
  const fetchCustomers = async () => {
    // Check cache first
    const cached = getCachedData('customers_list');
    if (cached) {
      return cached;
    }
    
    // Otherwise fetch from API
    const response = await apiClient.get('/customers');
    setCachedData('customers_list', response.data);
    return response.data;
  };
};
```

**Cache Management:**
```javascript
// Clear specific cache
store.removeCachedData('customers_list');

// Clear related cache by pattern
store.clearCacheByPattern('customers_.*');

// Get cache statistics
console.log(store.getCacheStats());
// { totalKeys: 5, validCount: 3, expiredCount: 2, cacheTTL: 3600000 }
```

**localStorage Keys:**
- `oscar_app_data_cache` - Main cache object
- `oscar_app_data_cache_timestamps` - Timestamps for cache entries

---

## Creating a New Store with localStorage

To create a new store with localStorage persistence:

```javascript
// myNewStore.js
import { create } from 'zustand';
import { saveToStorage, loadFromStorage, removeFromStorage } from './storageUtils';

export const useMyStore = create((set, get) => ({
  // Load initial state from localStorage
  myData: loadFromStorage('my_store_data', {}),
  myPreference: loadFromStorage('my_store_preference', 'default'),

  // Action that saves to storage
  setMyData: (data) => {
    set({ myData: data });
    saveToStorage('my_store_data', data);
  },

  setMyPreference: (preference) => {
    set({ myPreference: preference });
    saveToStorage('my_store_preference', preference);
  },

  // Action to clear
  clearStore: () => {
    removeFromStorage('my_store_data');
    removeFromStorage('my_store_preference');
    set({ myData: {}, myPreference: 'default' });
  },
}));
```

## Best Practices

1. **Prefix keys uniquely**: Use descriptive prefixes (`auth_`, `ui_`, `cache_`) to avoid conflicts
2. **Handle large data**: Be mindful of localStorage size limits (~5-10MB per domain)
3. **Cache expiration**: Use `dataCache` store for time-sensitive data with TTL
4. **Sensitive data**: Never store passwords or sensitive tokens (use `auth_token` only for JWT)
5. **Error handling**: All storage methods have try-catch blocks and log errors
6. **Clean up**: Use specific removal methods rather than clearing all storage

## Debugging

The storage utilities include logging for debugging:

```javascript
// All operations log to console
[Storage] Saved: oscar_app_auth_user
[Storage] Loaded: oscar_app_auth_user
[Storage] Removed: oscar_app_auth_user
[DataCache] Cache hit for key: customers_list
[DataCache] Cache expired for key: products_list
```

Monitor these logs in browser DevTools Console (F12) to track storage operations.

## Clearing Storage

To clear all app data:

```javascript
import { clearAllStorage } from './store/storageUtils';

clearAllStorage(); // Removes all oscar_app_* keys
```

Or individual stores:
```javascript
useAuthStore().clearAuthStorage();
useUIStore().resetPreferences();
useDataCacheStore().clearAllCache();
```
