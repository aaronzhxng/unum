import { getDb } from "./database";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const billsListCache = {
  get(): any[] | null {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ data: string; fetched_at: number }>(
        "SELECT data, fetched_at FROM bills_list_cache WHERE id = 1",
      );
      if (!row) return null;
      const age = Date.now() - row.fetched_at;
      if (age > CACHE_DURATION_MS) return null; // expired
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  },

  save(bills: any[]): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO bills_list_cache (id, data, fetched_at) VALUES (1, ?, ?)`,
        [JSON.stringify(bills), Date.now()],
      );
    } catch (error) {
      console.error("Failed to save bills list cache:", error);
    }
  },

  clear(): void {
    try {
      const db = getDb();
      db.runSync("DELETE FROM bills_list_cache WHERE id = 1");
    } catch {}
  },
};
