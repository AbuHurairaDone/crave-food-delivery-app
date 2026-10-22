import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@crave_onboarding_completed',
  AUTH_USER: '@crave_auth_user',
  CART: '@crave_cart',
  SAVED_ADDRESSES: '@crave_saved_addresses',
  FAVORITE_RESTAURANTS: '@crave_fav_restaurants',
  FAVORITE_FOODS: '@crave_fav_foods',
  ORDERS: '@crave_orders',
};

// In-memory fallback map for test runners / environments without AsyncStorage
const memoryFallback = new Map<string, string>();

export const storage = {
  async setItem<T>(key: string, value: T): Promise<void> {
    const jsonValue = JSON.stringify(value);
    memoryFallback.set(key, jsonValue);
    try {
      await AsyncStorage.setItem(key, jsonValue);
    } catch {
      // In-memory fallback is active
    }
  },

  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        return JSON.parse(jsonValue) as T;
      }
    } catch {
      // Check in-memory fallback
    }

    const cached = memoryFallback.get(key);
    if (cached != null) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        return defaultValue;
      }
    }

    return defaultValue;
  },

  async removeItem(key: string): Promise<void> {
    memoryFallback.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // In-memory fallback is active
    }
  },

  async clearAll(): Promise<void> {
    memoryFallback.clear();
    try {
      await AsyncStorage.clear();
    } catch {
      // In-memory fallback is active
    }
  },

  KEYS: STORAGE_KEYS,
};
