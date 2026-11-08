// Each member's details and sponsored and cosponsored bills, kept ready in the
// database so a profile opens instantly. Long-serving members can take several seconds to
// download, so a job keeps every current member fresh in the background, and
// a visitor gets the saved copy even when it is due for a refresh.
import axios from "axios";
import cron from "node-cron";
import db from "./db";

export type MemberKind = "sponsored" | "cosponsored";
type MemberList = { legislation: any[]; count: number };

// Refreshed once older than this, by the job or by a visit
const REFRESH_AFTER_MS = 12 * 60 * 60 * 1000;
// Few enough per run to stay well under Congress.gov's hourly limit
const WARM_PER_MINUTE = 3;
const PAGE = 250;

// The list is not strictly newest to oldest: older bills are mixed in with
// 119th congress ones across several pages. So seeing an older bill says
// nothing, and only a page with no 119th congress items at all means the rest
// can be skipped.
const hasMoreOfThisCongress = (page: any[], pagination?: { next?: string }): boolean =>
  !!pagination?.next && page.some((b) => b.congress === 119);

const fetchMemberList = async (id: string, kind: MemberKind): Promise<MemberList> => {
  const legislation: any[] = [];
  let count = 0;
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await axios.get(`https://api.congress.gov/v3/member/${id}/${kind}-legislation`, {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: { limit: PAGE, offset, format: "json" },
      timeout: 15000,
    });
    if (offset === 0) count = data.pagination?.count ?? 0;
    const page: any[] = data[`${kind}Legislation`] || [];
    legislation.push(...page.filter((b) => b.congress === 119));
    if (!hasMoreOfThisCongress(page, data.pagination)) return { legislation, count };
  }
};

// The member's own record (name, party, terms), which opens their profile
const fetchMemberDetails = async (id: string): Promise<any> => {
  const { data } = await axios.get(`https://api.congress.gov/v3/member/${id}`, {
    headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
    params: { format: "json" },
    timeout: 15000,
  });
  return data;
};

const listKey = (id: string, kind: MemberKind) => `member-${kind}-${id}`;
// The key the details were cached under before they moved here, so the
// copies already saved still count
const detailsKey = (id: string) => `official-${id}`;

const readSaved = <T>(key: string) => {
  const row = db
    .prepare(`SELECT data, cached_at FROM congress_cache WHERE cache_key = ?`)
    .get(key) as { data: string; cached_at: number } | undefined;
  return row ? { value: JSON.parse(row.data) as T, age: Date.now() - row.cached_at } : null;
};

const isDue = (key: string) => {
  const saved = readSaved(key);
  return !saved || saved.age > REFRESH_AFTER_MS;
};

const inFlight = new Map<string, Promise<any>>();

// Downloads and saves under key, sharing one download between simultaneous
// callers
const refresh = <T>(key: string, download: () => Promise<T>): Promise<T> => {
  const running = inFlight.get(key);
  if (running) return running;
  const pending = download()
    .then((value) => {
      db.prepare(
        `INSERT INTO congress_cache (cache_key, data, cached_at) VALUES (?, ?, ?)
         ON CONFLICT(cache_key) DO UPDATE SET data = excluded.data, cached_at = excluded.cached_at`,
      ).run(key, JSON.stringify(value), Date.now());
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, pending);
  return pending;
};

// The saved copy, even when it's due for a refresh, so a visitor never waits
// on Congress.gov unless nothing has been saved yet
const load = async <T>(key: string, download: () => Promise<T>): Promise<T> => {
  const saved = readSaved<T>(key);
  if (!saved) return refresh(key, download);
  if (saved.age > REFRESH_AFTER_MS) {
    refresh(key, download).catch((error) => console.warn(`Refresh failed for ${key}:`, error.message));
  }
  return saved.value;
};

const refreshList = (id: string, kind: MemberKind) => refresh(listKey(id, kind), () => fetchMemberList(id, kind));
const refreshDetails = (id: string) => refresh(detailsKey(id), () => fetchMemberDetails(id));

export const loadMemberList = (id: string, kind: MemberKind): Promise<MemberList> =>
  load(listKey(id, kind), () => fetchMemberList(id, kind));

export const loadMemberDetails = (id: string): Promise<any> => load(detailsKey(id), () => fetchMemberDetails(id));

let currentMembers: { ids: string[]; fetchedAt: number } = { ids: [], fetchedAt: 0 };

const currentMemberIds = async (): Promise<string[]> => {
  if (Date.now() - currentMembers.fetchedAt < 24 * 60 * 60 * 1000) return currentMembers.ids;
  const ids: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await axios.get("https://api.congress.gov/v3/member", {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: { limit: PAGE, offset, currentMember: true, format: "json" },
      timeout: 30000,
    });
    ids.push(...(data.members || []).map((m: any) => m.bioguideId));
    if (!data.pagination?.next) break;
  }
  currentMembers = { ids, fetchedAt: Date.now() };
  return ids;
};

let warming = false;

const warmMembers = async (): Promise<void> => {
  if (warming) return;
  warming = true;
  try {
    const due = (await currentMemberIds())
      .filter((id) => isDue(detailsKey(id)) || isDue(listKey(id, "sponsored")) || isDue(listKey(id, "cosponsored")))
      .slice(0, WARM_PER_MINUTE);
    for (const id of due) {
      await Promise.all([refreshDetails(id), refreshList(id, "sponsored"), refreshList(id, "cosponsored")]);
    }
  } catch (error: any) {
    console.warn("Member list warm-up failed:", error.message);
  } finally {
    warming = false;
  }
};

export const startMemberWarmUp = () => {
  cron.schedule("* * * * *", warmMembers);
};
