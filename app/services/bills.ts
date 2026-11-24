import { getDb } from "../utils/database";
import { queryClient } from "../utils/queryClient";
import { apiClient, BACKEND_URL } from "./api";

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

const upsertBills = (bills: Bill[], preserveOrder = false, orderBase = 0): void => {
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
        preserveOrder ? orderBase + index : null,
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

const getMeta = (key: string): string | null => {
  try {
    return (
      getDb().getFirstSync<{ value: string }>(
        `SELECT value FROM meta WHERE key = ?`,
        [key],
      )?.value ?? null
    );
  } catch {
    return null;
  }
};

const setMeta = (key: string, value: string): void => {
  try {
    getDb().runSync(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value],
    );
  } catch {}
};

const clearMeta = (key: string): void => {
  try {
    getDb().runSync(`DELETE FROM meta WHERE key = ?`, [key]);
  } catch {}
};

// ─── Background sync ─────────────────────────

const SYNC_CURSOR = "bills_sync_cursor";
const FIRST_DOWNLOAD_OFFSET = "bills_first_download_offset";
const BATCH = 500;
// New installs start with this many, the most recent, so the list opens fast
const FIRST_BATCH = 1000;

type ChangesResponse = BillsResponse & { cursor: number; more: boolean };
type PageResponse = BillsResponse & { head: number; more: boolean };

// Lets the bills screen show that newer bills are on the way
let syncing = false;
const syncListeners = new Set<() => void>();
const setSyncing = (value: boolean) => {
  syncing = value;
  syncListeners.forEach((listener) => listener());
};
export const billSync = {
  isSyncing: () => syncing,
  subscribe: (listener: () => void) => {
    syncListeners.add(listener);
    return () => {
      syncListeners.delete(listener);
    };
  },
};

const refreshList = () =>
  queryClient.invalidateQueries({ queryKey: ["bills", "v2"] });

// Saves its place after every batch, so closing the app or losing signal
// picks up where it stopped instead of starting over
const finishFirstDownload = async (start: number): Promise<void> => {
  for (let offset = start; ; offset += BATCH) {
    const page = await apiClient.get<PageResponse>(
      `/bills/sync?offset=${offset}&limit=${BATCH}`,
    );
    upsertBills(page.bills, true, offset);
    if (!page.more) {
      setMeta(SYNC_CURSOR, String(page.head));
      clearMeta(FIRST_DOWNLOAD_OFFSET);
      return;
    }
    setMeta(FIRST_DOWNLOAD_OFFSET, String(offset + BATCH));
  }
};

const syncChanges = async (): Promise<number> => {
  let cursor = getMeta(SYNC_CURSOR);
  // Phones from before this sync existed only know the day they last synced
  const lastSync = cursor === null ? getLastSyncDate() : null;
  let url =
    lastSync !== null
      ? `/bills/sync?since=${lastSync}&limit=${BATCH}`
      : `/bills/sync?after=${cursor ?? 0}&limit=${BATCH}`;
  let total = 0;
  while (true) {
    const page = await apiClient.get<ChangesResponse>(url);
    if (page.bills.length > 0) upsertBills(page.bills);
    total += page.bills.length;
    cursor = String(page.cursor);
    setMeta(SYNC_CURSOR, cursor);
    if (!page.more) return total;
    url = `/bills/sync?after=${cursor}&limit=${BATCH}`;
  }
};

// The original route, for when the backend's new one is not available
const syncChangesFromOriginalRoute = async (): Promise<number> => {
  const since = getLastSyncDate();
  const fresh = await apiClient.get<BillsResponse>(
    since ? `/bills?since=${since}` : `/bills`,
  );
  if (fresh.bills.length > 0) upsertBills(fresh.bills);
  return fresh.bills.length;
};

let syncInProgress = false;

const runDeltaSync = async (): Promise<void> => {
  if (syncInProgress) return;
  syncInProgress = true;
  setSyncing(true);

  try {
    let listChanged = false;
    try {
      const offset = getMeta(FIRST_DOWNLOAD_OFFSET);
      if (offset !== null) {
        await finishFirstDownload(Number(offset));
        listChanged = true;
      }
      if ((await syncChanges()) > 0) listChanged = true;
    } catch (error) {
      if (getMeta(FIRST_DOWNLOAD_OFFSET) !== null) throw error;
      if ((await syncChangesFromOriginalRoute()) > 0) listChanged = true;
    }
    if (listChanged) refreshList();
    setLastSyncDate(new Date().toISOString().split("T")[0]);
  } catch (error) {
    // Background-only: bills keep loading from SQLite, and the next sync
    // resumes from the saved place
    if (__DEV__) console.warn("Bill sync failed (non-critical):", error);
  } finally {
    syncInProgress = false;
    setSyncing(false);
  }
};

const enrichBackend = async (): Promise<void> => {
  try {
    const db = getDb();

    // Needs every bill, so it waits for a new install's download to finish
    if (getMeta(FIRST_DOWNLOAD_OFFSET) !== null) return;

    // Only run once
    const already = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'backend_enriched_v2'`,
    );
    if (already) return;

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
      `INSERT INTO meta (key, value) VALUES ('backend_enriched_v2', 'true')
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
    // New install: the most recent bills now, the rest in the background
    const policyAreas = billsService
      .getPolicyAreas()
      .then(savePolicyAreaMap)
      .catch(() => {});
    let first: BillsResponse;
    try {
      const page = await apiClient.get<PageResponse>(
        `/bills/sync?offset=0&limit=${FIRST_BATCH}`,
      );
      first = page;
      upsertBills(page.bills, true);
      setMeta(
        page.more ? FIRST_DOWNLOAD_OFFSET : SYNC_CURSOR,
        String(page.more ? FIRST_BATCH : page.head),
      );
      runDeltaSync();
    } catch {
      // The new route is not available: everything at once, the original way
      first = await apiClient.get<BillsResponse>("/bills");
      upsertBills(first.bills, true);
      setLastSyncDate(new Date().toISOString().split("T")[0]);
    }
    await policyAreas;

    // One-time: send sponsor_state and policy_area to Railway for cron use
    enrichBackend().catch(() => {});

    // Return with policy areas already applied
    return getAllBillsFromSQLite() ?? first;
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

  getFeatured: async (): Promise<any> => {
    return apiClient.get("/bills/featured");
  },
};
