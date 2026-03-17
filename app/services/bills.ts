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
  originChamber?: string;
  policyArea?: { name: string };
  sponsors?: { state: string }[];
}

interface BillsResponse {
  bills: Bill[];
  pagination: { count: number };
}

const congressParam = (congress?: number) =>
  congress ? `?congress=${congress}` : "";

// ─── SQLite helpers ───────────────────────────────────────────────────────────

const upsertBills = (bills: Bill[]): void => {
  const db = getDb();
  const stmt = db.prepareSync(
    `INSERT INTO bills (bill_id, type, number, congress, title, origin_chamber,
      latest_action_date, latest_action_text, update_date, policy_area,
      sponsor_state, data, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(bill_id) DO UPDATE SET
       title = excluded.title,
       latest_action_date = excluded.latest_action_date,
       latest_action_text = excluded.latest_action_text,
       update_date = excluded.update_date,
       policy_area = excluded.policy_area,
       sponsor_state = excluded.sponsor_state,
       data = excluded.data,
       synced_at = excluded.synced_at`,
  );

  const now = Date.now();
  db.withTransactionSync(() => {
    for (const bill of bills) {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;
      stmt.executeSync([
        billId,
        bill.type,
        bill.number,
        bill.congress,
        bill.title,
        bill.originChamber ?? null,
        bill.latestAction?.actionDate ?? null,
        bill.latestAction?.text ?? null,
        bill.updateDate ?? null,
        bill.policyArea?.name ?? null,
        bill.sponsors?.[0]?.state ?? null,
        JSON.stringify(bill),
        now,
      ]);
    }
  });
  stmt.finalizeSync();
};

const getAllBillsFromSQLite = (): BillsResponse | null => {
  try {
    const db = getDb();
    const count = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM bills`,
    );
    if (!count || count.count === 0) return null;

    const rows = db.getAllSync<{ data: string }>(
      `SELECT data FROM bills ORDER BY update_date DESC`,
    );
    return {
      bills: rows.map((r) => JSON.parse(r.data)),
      pagination: { count: count.count },
    };
  } catch {
    return null;
  }
};

const getLastSyncDate = (): string | null => {
  try {
    const db = getDb();
    const row = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'last_bills_sync'`,
    );
    return row?.value ?? null;
  } catch {
    return null;
  }
};

const setLastSyncDate = (date: string): void => {
  try {
    const db = getDb();
    db.runSync(
      `INSERT INTO meta (key, value) VALUES ('last_bills_sync', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [date],
    );
  } catch {}
};

// ─── Background delta sync ────────────────────────────────────────────────────

let syncInProgress = false;

const runDeltaSync = async (): Promise<void> => {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const lastSync = getLastSyncDate();
    const since = lastSync ?? undefined;

    const url = since ? `/bills?since=${since}` : `/bills`;
    const fresh = await apiClient.get<BillsResponse>(url);

    if (fresh.bills.length > 0) {
      upsertBills(fresh.bills);
    }

    // Save today as last sync date
    const today = new Date().toISOString().split("T")[0];
    setLastSyncDate(today);
  } catch (error) {
    console.error("Delta sync failed:", error);
  } finally {
    syncInProgress = false;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const billsService = {
  getAll: async (): Promise<BillsResponse> => {
    const cached = getAllBillsFromSQLite();

    if (cached) {
      // Return local data immediately, sync in background
      runDeltaSync();
      return cached;
    }

    // First launch — fetch everything from Railway
    const fresh = await apiClient.get<BillsResponse>("/bills");
    upsertBills(fresh.bills);
    const today = new Date().toISOString().split("T")[0];
    setLastSyncDate(today);
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

  getPolicyAreas: async (): Promise<Record<string, string>> => {
    return apiClient.get<Record<string, string>>("/bills/policy-areas");
  },
};
