// Replaces the AsyncStorage-backed officialBillsCache.ts
// API surface is IDENTICAL — no screen changes needed.

import { getDb } from "./database";

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const officialBillsCache = {
  // Save to cache
  save: (key: string, data: any): void => {
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO official_bills_cache (cache_key, data, fetched_at) VALUES (?, ?, ?)
         ON CONFLICT(cache_key) DO UPDATE SET
           data = excluded.data,
           fetched_at = excluded.fetched_at`,
        [key, JSON.stringify(data), Date.now()],
      );
    } catch (error) {
      console.error("Error saving official bills to cache:", error);
    }
  },

  // Get from cache (returns null if missing or expired)
  get: (key: string): any | null => {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ data: string; fetched_at: number }>(
        `SELECT data, fetched_at FROM official_bills_cache WHERE cache_key = ?`,
        [key],
      );

      if (!row) return null;

      if (Date.now() - row.fetched_at > CACHE_EXPIRY_MS) {
        db.runSync(`DELETE FROM official_bills_cache WHERE cache_key = ?`, [
          key,
        ]);
        return null;
      }

      return JSON.parse(row.data);
    } catch (error) {
      console.error("Error reading official bills from cache:", error);
      return null;
    }
  },

  // Clear all cached official bills
  clearAll: (): void => {
    try {
      const db = getDb();
      db.runSync(`DELETE FROM official_bills_cache`);
    } catch (error) {
      console.error("Error clearing official bills cache:", error);
    }
  },
};
