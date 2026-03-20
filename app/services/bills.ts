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

const upsertBills = (bills: Bill[], preserveOrder = false): void => {
  const db = getDb();
  const stmt = db.prepareSync(
    `INSERT INTO bills (bill_id, type, number, congress, title, origin_chamber,
      latest_action_date, latest_action_text, update_date, policy_area,
      sponsor_state, congress_order, data, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(bill_id) DO UPDATE SET
       title = excluded.title,
       latest_action_date = excluded.latest_action_date,
       latest_action_text = excluded.latest_action_text,
       update_date = excluded.update_date,
       policy_area = excluded.policy_area,
       sponsor_state = excluded.sponsor_state,
       congress_order = CASE WHEN excluded.congress_order IS NOT NULL THEN excluded.congress_order ELSE bills.congress_order END,
       data = excluded.data,
       synced_at = excluded.synced_at`,
  );

  const now = Date.now();
  db.withTransactionSync(() => {
    bills.forEach((bill, index) => {
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
        preserveOrder ? index : null,
        JSON.stringify(bill),
        now,
      ]);
    });
  });
  stmt.finalizeSync();
};

const getPolicyAreaMap = (): Record<string, string> => {
  try {
    const db = getDb();
    const row = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'policy_areas_map'`,
    );
    if (!row) return {};
    return JSON.parse(row.value);
  } catch {
    return {};
  }
};

const savePolicyAreaMap = (map: Record<string, string>): void => {
  try {
    const db = getDb();
    db.runSync(
      `INSERT INTO meta (key, value) VALUES ('policy_areas_map', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [JSON.stringify(map)],
    );
  } catch {}
};

const getAllBillsFromSQLite = (): BillsResponse | null => {
  try {
    const db = getDb();
    const count = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM bills`,
    );
    if (!count || count.count === 0) return null;

    const rows = db.getAllSync<{
      data: string;
      bill_id: string;
      policy_area: string | null;
      congress_order: number | null;
    }>(`SELECT data, bill_id, policy_area, congress_order FROM bills`);

    // Load policy areas from policy_areas_map and bill_cache
    const policyAreaMap = getPolicyAreaMap();
    const cacheRows = db.getAllSync<{ bill_id: string; data: string }>(
      `SELECT bill_id, data FROM bill_cache WHERE fetched_at > ?`,
      [Date.now() - 7 * 24 * 60 * 60 * 1000],
    );
    for (const row of cacheRows) {
      try {
        const parsed = JSON.parse(row.data);
        if (parsed?.policyArea?.name) {
          policyAreaMap[row.bill_id] = parsed.policyArea.name;
        }
      } catch {}
    }

    return {
      bills: rows.map((r) => {
        const bill = JSON.parse(r.data);
        const policyAreaName =
          r.policy_area ?? policyAreaMap[r.bill_id] ?? null;
        return {
          ...bill,
          policyArea: policyAreaName
            ? { name: policyAreaName }
            : (bill.policyArea ?? null),
          _congressOrder: r.congress_order,
        };
      }),
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

    const today = new Date().toISOString().split("T")[0];
    setLastSyncDate(today);
  } catch (error) {
    console.error("Delta sync failed:", error);
  } finally {
    syncInProgress = false;
  }
};

const BACKEND_URL = "https://unum-production.up.railway.app";

const enrichBackend = async (): Promise<void> => {
  try {
    const db = getDb();

    // Only run once
    const already = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'backend_enriched_v1'`,
    );
    // if (already) return;  // temporarily disabled to force re-run

    // Force re-run by clearing the flag
    // db.runSync(`DELETE FROM meta WHERE key = 'backend_enriched_v1'`);

    // Get all bills
    const rows = db.getAllSync<{
      bill_id: string;
      sponsor_state: string | null;
      policy_area: string | null;
    }>(`SELECT bill_id, sponsor_state, policy_area FROM bills`);

    if (rows.length === 0) return;

    // Load policy area map to fill in missing policy_area values
    const policyAreaMapRow = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'policy_areas_map'`,
    );
    const policyAreaMap: Record<string, string> = policyAreaMapRow
      ? JSON.parse(policyAreaMapRow.value)
      : {};

    // Merge map into rows
    const enrichedRows = rows
      .map((r) => ({
        ...r,
        policy_area: r.policy_area ?? policyAreaMap[r.bill_id] ?? null,
      }))
      .filter((r) => r.policy_area !== null || r.sponsor_state !== null);

    if (enrichedRows.length === 0) return;

    // Send in batches of 500
    for (let i = 0; i < enrichedRows.length; i += 500) {
      const batch = enrichedRows.slice(i, i + 500);
      await fetch(`${BACKEND_URL}/api/bills/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bills: batch.map((b) => ({
            billId: b.bill_id,
            sponsorState: b.sponsor_state,
            policyArea: b.policy_area,
          })),
        }),
      });
    }

    // Mark complete so it never runs again
    db.runSync(
      `INSERT INTO meta (key, value) VALUES ('backend_enriched_v1', 'true')
       ON CONFLICT(key) DO UPDATE SET value = 'true'`,
    );
  } catch (err) {
    console.error("Backend enrichment failed:", err);
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const billsService = {
  getAll: async (): Promise<BillsResponse> => {
    // Fetch and cache policy areas map, then return enriched data
    const cached = getAllBillsFromSQLite();

    if (cached) {
      billsService
        .getPolicyAreas()
        .then(savePolicyAreaMap)
        .catch(() => {});
      runDeltaSync();
      enrichBackend().catch(() => {});
      return cached;
    }
    // First launch — fetch policy areas AND bills together
    // First launch — fetch policy areas AND bills together
    const [fresh] = await Promise.all([
      apiClient.get<BillsResponse>("/bills"),
      billsService
        .getPolicyAreas()
        .then(savePolicyAreaMap)
        .catch(() => {}),
    ]);

    upsertBills(fresh.bills, true); // preserve order on full fetch

    const today = new Date().toISOString().split("T")[0];
    setLastSyncDate(today);

    // One-time: send sponsor_state and policy_area to Railway for cron use
    enrichBackend().catch(() => {});

    // Return with policy areas already applied
    return getAllBillsFromSQLite() ?? fresh;
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
