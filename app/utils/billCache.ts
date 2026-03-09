// Replaces the AsyncStorage-backed billCache.ts
// API surface is IDENTICAL — no screen changes needed.

import { getDb } from "./database";

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const billCache = {
  // Save bill details to cache
  saveBill: (billId: string, billData: any): void => {
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO bill_cache (bill_id, data, fetched_at) VALUES (?, ?, ?)
         ON CONFLICT(bill_id) DO UPDATE SET
           data = excluded.data,
           fetched_at = excluded.fetched_at`,
        [billId, JSON.stringify(billData), Date.now()],
      );
    } catch (error) {
      console.error("Error saving bill to cache:", error);
    }
  },

  // Get bill from cache (returns null if missing or expired)
  getBill: (billId: string): any | null => {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ data: string; fetched_at: number }>(
        `SELECT data, fetched_at FROM bill_cache WHERE bill_id = ?`,
        [billId],
      );

      if (!row) return null;

      if (Date.now() - row.fetched_at > CACHE_EXPIRY_MS) {
        db.runSync(`DELETE FROM bill_cache WHERE bill_id = ?`, [billId]);
        return null;
      }

      return JSON.parse(row.data);
    } catch (error) {
      console.error("Error reading bill from cache:", error);
      return null;
    }
  },

  // Clear all cached bills
  clearAll: (): void => {
    try {
      const db = getDb();
      db.runSync(`DELETE FROM bill_cache`);
    } catch (error) {
      console.error("Error clearing bill cache:", error);
    }
  },
};
