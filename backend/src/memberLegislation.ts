// Each member's sponsored and cosponsored bills, kept ready in the database so
// a profile opens instantly. Long-serving members can take several seconds to
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

const cacheKey = (id: string, kind: MemberKind) => `member-${kind}-${id}`;

const readSaved = (id: string, kind: MemberKind) => {
  const row = db
    .prepare(`SELECT data, cached_at FROM congress_cache WHERE cache_key = ?`)
    .get(cacheKey(id, kind)) as { data: string; cached_at: number } | undefined;
  return row ? { list: JSON.parse(row.data) as MemberList, age: Date.now() - row.cached_at } : null;
};

const inFlight = new Map<string, Promise<MemberList>>();

// Downloads and saves a list, sharing one download between simultaneous callers
const refresh = (id: string, kind: MemberKind): Promise<MemberList> => {
  const key = cacheKey(id, kind);
  const running = inFlight.get(key);
  if (running) return running;
  const download = fetchMemberList(id, kind)
    .then((list) => {
      db.prepare(
        `INSERT INTO congress_cache (cache_key, data, cached_at) VALUES (?, ?, ?)
         ON CONFLICT(cache_key) DO UPDATE SET data = excluded.data, cached_at = excluded.cached_at`,
      ).run(key, JSON.stringify(list), Date.now());
      return list;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, download);
  return download;
};

export const loadMemberList = async (id: string, kind: MemberKind): Promise<MemberList> => {
  const saved = readSaved(id, kind);
  if (!saved) return refresh(id, kind);
  if (saved.age > REFRESH_AFTER_MS) {
    refresh(id, kind).catch((error) => console.warn(`Refresh failed for ${id}:`, error.message));
  }
  return saved.list;
};

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
      .filter((id) =>
        (["sponsored", "cosponsored"] as const).some((kind) => {
          const saved = readSaved(id, kind);
          return !saved || saved.age > REFRESH_AFTER_MS;
        }),
      )
      .slice(0, WARM_PER_MINUTE);
    for (const id of due) {
      await Promise.all([refresh(id, "sponsored"), refresh(id, "cosponsored")]);
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
