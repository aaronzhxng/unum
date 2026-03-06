import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGISLATION_LIST_KEY = "legislation_list_cache";
const CACHE_EXPIRY_DAYS = 1; // bills list changes daily

interface CachedLegislationList {
  data: any;
  timestamp: number;
}

export const legislationListCache = {
  save: async (data: any): Promise<void> => {
    try {
      const cached: CachedLegislationList = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(LEGISLATION_LIST_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error("Error saving legislation list to cache:", error);
    }
  },

  get: async (): Promise<any | null> => {
    try {
      const cached = await AsyncStorage.getItem(LEGISLATION_LIST_KEY);
      if (!cached) return null;

      const parsed: CachedLegislationList = JSON.parse(cached);
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (Date.now() - parsed.timestamp > expiryTime) {
        await AsyncStorage.removeItem(LEGISLATION_LIST_KEY);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Error reading legislation list from cache:", error);
      return null;
    }
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.removeItem(LEGISLATION_LIST_KEY);
  },
};
