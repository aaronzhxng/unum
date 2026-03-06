import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFICIAL_BILLS_CACHE_PREFIX = "official_bills_cache_";
const CACHE_EXPIRY_DAYS = 7;

interface CachedOfficialBills {
  data: any;
  timestamp: number;
}

export const officialBillsCache = {
  save: async (key: string, data: any): Promise<void> => {
    try {
      const cached: CachedOfficialBills = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `${OFFICIAL_BILLS_CACHE_PREFIX}${key}`,
        JSON.stringify(cached),
      );
    } catch (error) {
      console.error("Error saving official bills to cache:", error);
    }
  },

  get: async (key: string): Promise<any | null> => {
    try {
      const cached = await AsyncStorage.getItem(
        `${OFFICIAL_BILLS_CACHE_PREFIX}${key}`,
      );
      if (!cached) return null;

      const parsed: CachedOfficialBills = JSON.parse(cached);

      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (now - parsed.timestamp > expiryTime) {
        await AsyncStorage.removeItem(`${OFFICIAL_BILLS_CACHE_PREFIX}${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Error reading official bills from cache:", error);
      return null;
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const officialKeys = keys.filter((key) =>
        key.startsWith(OFFICIAL_BILLS_CACHE_PREFIX),
      );
      await AsyncStorage.multiRemove(officialKeys);
    } catch (error) {
      console.error("Error clearing official bills cache:", error);
    }
  },
};
