// The backend's own copy of every bill, so phones never wait on Congress.gov.
// A job refreshes it every 15 minutes. Congress.gov marks many bills as updated
// with nothing a reader could see changing, so a bill only counts as changed
// when its content does. Every real change gets a higher seq, and phones ask
// for what changed after the last seq they saw.
import axios from "axios";
import cron from "node-cron";
import db from "./db";

const CONGRESS = 119;
const PAGE = 250;
// Catches bills updated while the previous refresh was running
const OVERLAP_MS = 2 * 60 * 1000;

db.exec(`
  CREATE TABLE IF NOT EXISTS bill_store (
    bill_id TEXT PRIMARY KEY,
    congress INTEGER NOT NULL,
    data TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    update_date TEXT,
    changed_at TEXT NOT NULL,
    seq INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_bill_store_seq ON bill_store(seq);
  CREATE INDEX IF NOT EXISTS idx_bill_store_update ON bill_store(update_date DESC);
  CREATE INDEX IF NOT EXISTS idx_bill_store_changed ON bill_store(changed_at);
  CREATE TABLE IF NOT EXISTS bill_store_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const getMeta = (key: string): string | undefined =>
  (db.prepare(`SELECT value FROM bill_store_meta WHERE key = ?`).get(key) as { value: string } | undefined)?.value;
const setMeta = (key: string, value: string) =>
  db.prepare(`INSERT INTO bill_store_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);

// Filled once a full download has finished; until then the routes fall back
// to asking Congress.gov directly
export const storeReady = (): boolean => !!getMeta("refreshed_through");

export const headSeq = (): number =>
  (db.prepare(`SELECT COALESCE(MAX(seq), 0) AS seq FROM bill_store`).get() as { seq: number }).seq;

// Everything a reader can see, leaving out the fields that change on their own
const fingerprintOf = (bill: any): string =>
  JSON.stringify([bill.title, bill.originChamber, bill.latestAction?.actionDate, bill.latestAction?.text]);

const selectExisting = db.prepare(`SELECT fingerprint FROM bill_store WHERE bill_id = ?`);
const upsert = db.prepare(`
  INSERT INTO bill_store (bill_id, congress, data, fingerprint, update_date, changed_at, seq)
  VALUES (@billId, @congress, @data, @fingerprint, @updateDate, @changedAt, @seq)
  ON CONFLICT(bill_id) DO UPDATE SET
    data = excluded.data,
    fingerprint = excluded.fingerprint,
    update_date = excluded.update_date,
    changed_at = excluded.changed_at,
    seq = excluded.seq
`);
// The table the notification job reads. Bills from this list have no sponsor
// or policy area, so those keep whatever was filled in earlier.
const syncBillsTable = db.prepare(`
  INSERT INTO bills (bill_id, type, number, title, policy_area, sponsor_state, update_date, latest_action_date, synced_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(bill_id) DO UPDATE SET
    title = excluded.title,
    sponsor_state = COALESCE(excluded.sponsor_state, bills.sponsor_state),
    update_date = excluded.update_date,
    latest_action_date = excluded.latest_action_date,
    synced_at = excluded.synced_at,
    policy_area = COALESCE(excluded.policy_area, bills.policy_area)
`);

// Returns how many bills really changed. The first download dates each bill by
// Congress.gov's update date, so phones catching up by date get a sensible set.
const saveBills = db.transaction((bills: any[], firstDownload: boolean): number => {
  let seq = headSeq();
  let changed = 0;
  const now = new Date().toISOString();
  for (const bill of bills) {
    const billId = `${bill.type.toLowerCase()}${bill.number}`;
    const fingerprint = fingerprintOf(bill);
    const existing = selectExisting.get(billId) as { fingerprint: string } | undefined;
    if (existing?.fingerprint === fingerprint) continue;
    upsert.run({
      billId,
      congress: bill.congress,
      data: JSON.stringify(bill),
      fingerprint,
      updateDate: bill.updateDate ?? null,
      changedAt: firstDownload ? (bill.updateDate ?? now) : now,
      seq: ++seq,
    });
    syncBillsTable.run(
      billId, bill.type, bill.number, bill.title, bill.policyArea?.name ?? null, bill.sponsors?.[0]?.state ?? null,
      bill.updateDate ?? null, bill.latestAction?.actionDate ?? null, Date.now(),
    );
    changed++;
  }
  return changed;
});

let refreshing = false;

export const refreshBillStore = async (): Promise<void> => {
  if (refreshing) return;
  refreshing = true;
  const startedAt = Date.now();
  const since = getMeta("refreshed_through");
  try {
    let changed = 0, seen = 0;
    const firstDownload: any[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const params: any = { limit: PAGE, offset, sort: "updateDate+desc", format: "json" };
      if (since) params.fromDateTime = since;
      const { data } = await axios.get(`https://api.congress.gov/v3/bill/${CONGRESS}`, {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params,
        timeout: 30000,
      });
      const page = (data.bills || []).filter((b: any) => b.congress === CONGRESS);
      if (since) changed += saveBills(page, false);
      else firstDownload.push(...page);
      seen += page.length;
      if (!data.pagination?.next) break;
    }
    // seq must rise with date for seqBeforeDate, whatever order pages came in
    if (!since) {
      firstDownload.sort((a, b) => (a.updateDate ?? "").localeCompare(b.updateDate ?? ""));
      changed = saveBills(firstDownload, true);
    }
    // Only after a complete pass, so an interrupted one is simply run again
    setMeta("refreshed_through", new Date(startedAt - OVERLAP_MS).toISOString().replace(/\.\d+Z$/, "Z"));
    console.log(`Bill store: ${seen} checked, ${changed} changed in ${Math.round((Date.now() - startedAt) / 1000)}s`);
  } catch (error: any) {
    console.error("Bill store refresh failed:", error.message);
  } finally {
    refreshing = false;
  }
};

export const startBillStore = () => {
  refreshBillStore();
  cron.schedule("*/15 * * * *", refreshBillStore);
};

const parse = (rows: { data: string }[]) => rows.map((r) => JSON.parse(r.data));

// What changed after a seq, oldest change first, so a phone can stop anywhere
export const changesAfter = (after: number, limit: number) => {
  const rows = db.prepare(`SELECT data, seq FROM bill_store WHERE seq > ? ORDER BY seq LIMIT ?`).all(after, limit) as { data: string; seq: number }[];
  return { bills: parse(rows), cursor: rows.length ? rows[rows.length - 1].seq : after, more: rows.length === limit };
};

// The seq just before the first change on or after a date, for phones that
// only know the day they last synced
export const seqBeforeDate = (since: string): number => {
  const row = db.prepare(`SELECT MIN(seq) AS seq FROM bill_store WHERE changed_at >= ?`).get(since) as { seq: number | null };
  return row.seq === null ? headSeq() : row.seq - 1;
};

// Every bill, most recently updated first, for a new install. The phone keeps
// head and asks for changes after it once done.
export const billsPage = (offset: number, limit: number) => {
  const rows = db.prepare(`SELECT data FROM bill_store ORDER BY update_date DESC, bill_id LIMIT ? OFFSET ?`).all(limit, offset) as { data: string }[];
  return {
    bills: parse(rows).map((bill, i) => ({ ...bill, _apiOrder: offset + i })),
    head: headSeq(),
    more: rows.length === limit,
  };
};

// For the original /api/bills route, which current app versions still call
export const billsChangedSince = (since?: string) => {
  const rows = (since
    ? db.prepare(`SELECT data FROM bill_store WHERE changed_at >= ? ORDER BY update_date DESC`).all(since)
    : db.prepare(`SELECT data FROM bill_store ORDER BY update_date DESC`).all()) as { data: string }[];
  const bills = parse(rows).map((bill, i) => ({ ...bill, _apiOrder: i }));
  return { bills, pagination: { count: bills.length } };
};
