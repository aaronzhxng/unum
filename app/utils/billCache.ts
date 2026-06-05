// Replaces the AsyncStorage-backed billCache.ts
// API surface is IDENTICAL — no screen changes needed.

import { getDb } from "./database";

const getCacheExpiryMs = (billData: any): number => {
  const latestActionDate = billData?.latestAction?.actionDate;
  const status = billData?.latestAction?.text?.toLowerCase() ?? "";

  // Bill is fully resolved — never re-fetch
  if (
    status.includes("became public law") ||
    status.includes("signed by president") ||
    status.includes("vetoed by president") ||
    status.includes("failed") ||
    status.includes("withdrawn")
  ) {
    return Infinity;
  }

  if (!latestActionDate) return 7 * 24 * 60 * 60 * 1000; // fallback: 7 days

  const [y, m, d] = latestActionDate.split("-").map(Number);
  const daysSinceAction =
    (Date.now() - new Date(y, m - 1, d).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceAction < 30) return 2 * 24 * 60 * 60 * 1000; // active: 2 days
  if (daysSinceAction < 180) return 7 * 24 * 60 * 60 * 1000; // slow: 7 days
  return 30 * 24 * 60 * 60 * 1000; // dormant: 30 days
};

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

      const billData = JSON.parse(row.data);
      if (Date.now() - row.fetched_at > getCacheExpiryMs(billData)) {
        db.runSync(`DELETE FROM bill_cache WHERE bill_id = ?`, [billId]);
        return null;
      }

      return billData;
    } catch (error) {
      console.error("Error reading bill from cache:", error);
      return null;
    }
  },

  // Clear a single bill by its app-level billId (e.g. "hr22"), ignoring congress prefix
  clearBill: (billId: string): void => {
    try {
      const db = getDb();
      db.runSync(`DELETE FROM bill_cache WHERE bill_id LIKE ?`, [`%-${billId}`]);
    } catch (error) {
      console.error("Error clearing bill from cache:", error);
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
