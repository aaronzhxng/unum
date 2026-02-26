import AsyncStorage from "@react-native-async-storage/async-storage";

const BILL_CACHE_PREFIX = "bill_cache_";
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days

interface CachedBill {
  data: any;
  timestamp: number;
}

export const billCache = {
  // Save bill details to cache
  saveBill: async (billId: string, billData: any): Promise<void> => {
    try {
      const cached: CachedBill = {
        data: billData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `${BILL_CACHE_PREFIX}${billId}`,
        JSON.stringify(cached),
      );
    } catch (error) {
      console.error("Error saving bill to cache:", error);
    }
  },

  // Get bill from cache
  getBill: async (billId: string): Promise<any | null> => {
    try {
      const cached = await AsyncStorage.getItem(
        `${BILL_CACHE_PREFIX}${billId}`,
      );
      if (!cached) return null;

      const parsed: CachedBill = JSON.parse(cached);

      // Check if cache is expired
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (now - parsed.timestamp > expiryTime) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(`${BILL_CACHE_PREFIX}${billId}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Error reading bill from cache:", error);
      return null;
    }
  },

  // Clear all cached bills
  clearAll: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const billKeys = keys.filter((key) => key.startsWith(BILL_CACHE_PREFIX));
      await AsyncStorage.multiRemove(billKeys);
    } catch (error) {
      console.error("Error clearing bill cache:", error);
    }
  },
};
