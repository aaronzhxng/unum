import { getDb } from "../utils/database";
import { apiClient } from "./api";

interface Bill {
  congress: number;
  number: string;
  title: string;
  type: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  updateDate: string;
}

interface BillsResponse {
  bills: Bill[];
  pagination: {
    count: number;
  };
}

// How long before we consider the bills list stale and re-fetch in background.
// 1 hour — Railway's own in-memory cache is 1 hour, so this aligns with that.
const BILLS_LIST_STALE_MS = 60 * 60 * 1000;

const congressParam = (congress?: number) =>
  congress ? `?congress=${congress}` : "";

// ─── Cache helpers ────────────────────────────────────────────────────────────

const getCachedBillsList = (): {
  data: BillsResponse;
  fetchedAt: number;
} | null => {
  try {
    const db = getDb();
    const row = db.getFirstSync<{ data: string; fetched_at: number }>(
      `SELECT data, fetched_at FROM bills_list_cache WHERE id = 1`,
    );
    if (!row) return null;
    return { data: JSON.parse(row.data), fetchedAt: row.fetched_at };
  } catch {
    return null;
  }
};

const saveBillsListCache = (response: BillsResponse): void => {
  try {
    const db = getDb();
    db.runSync(
      `INSERT INTO bills_list_cache (id, data, fetched_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
      [JSON.stringify(response), Date.now()],
    );
  } catch (error) {
    console.error("Error saving bills list cache:", error);
  }
};

// ─── Background refresh ───────────────────────────────────────────────────────
// Fetches fresh data from Railway and updates SQLite silently.
// Never throws — failures are silent so they don't affect the UI.

let backgroundRefreshInProgress = false;

const refreshBillsInBackground = async (): Promise<void> => {
  if (backgroundRefreshInProgress) return;
  backgroundRefreshInProgress = true;

  try {
    console.log("🔄 Background refresh: fetching fresh bills from Railway...");
    const fresh = await apiClient.get<BillsResponse>("/bills");
    saveBillsListCache(fresh);
    console.log(
      `✅ Background refresh complete — ${fresh.bills.length} bills cached`,
    );
  } catch (error) {
    console.warn("Background bills refresh failed (silent):", error);
  } finally {
    backgroundRefreshInProgress = false;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const billsService = {
  // Stale-while-revalidate:
  // - If cache exists → return it immediately, refresh in background if stale
  // - If no cache → fetch from Railway (first ever launch only)
  getAll: async (): Promise<BillsResponse> => {
    const cached = getCachedBillsList();

    if (cached) {
      const isStale = Date.now() - cached.fetchedAt > BILLS_LIST_STALE_MS;
      if (isStale) {
        // Return stale data immediately, refresh quietly in background
        refreshBillsInBackground();
      }
      return cached.data;
    }

    // No cache at all — first launch, must wait for Railway
    console.log(
      "📡 No bills cache found — fetching from Railway (first launch)...",
    );
    const fresh = await apiClient.get<BillsResponse>("/bills");
    saveBillsListCache(fresh);
    return fresh;
  },

  getById: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}${congressParam(congress)}`);
  },

  getSummaries: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/summaries${congressParam(congress)}`,
    );
  },

  getActions: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}/actions${congressParam(congress)}`);
  },

  getAmendments: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/amendments${congressParam(congress)}`,
    );
  },

  getAmendmentDetails: async (
    amendmentType: string,
    amendmentNumber: string,
    congress?: number,
  ): Promise<any> => {
    return apiClient.get(
      `/amendments/${amendmentType}/${amendmentNumber}${congressParam(congress)}`,
    );
  },

  getVotes: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}/votes${congressParam(congress)}`);
  },

  getCosponsors: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/cosponsors${congressParam(congress)}`,
    );
  },

  search: async (query: string): Promise<any> => {
    return apiClient.get(`/bills/search?q=${encodeURIComponent(query)}`);
  },
};
