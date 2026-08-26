import axios from "axios";
import * as cron from "node-cron";
import db from "./db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const sendNotifications = async (
  messages: { to: string; title: string; body: string; data?: any }[],
) => {
  if (messages.length === 0) return;
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    try {
      const pushResponse = await axios.post(
        EXPO_PUSH_URL,
        chunk.map((msg) => ({
          ...msg,
          priority: "high",
          channelId: "default",
        })),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      console.log("Push API response:", JSON.stringify(pushResponse.data));
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }
};

const getAllRegistrations = (filterToken?: string) => {
  const sql = filterToken
    ? "SELECT * FROM push_registrations WHERE token = ?"
    : "SELECT * FROM push_registrations";
  const args = filterToken ? [filterToken] : [];
  return db.prepare(sql).all(...args) as {
    token: string;
    policy_areas: string;
    followed_states: string;
    followed_bills: string;
    followed_officials: string;
  }[];
};

const getLastChecked = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

// const getLastChecked = (): string => {
//   return "2026-04-14";
// };

const billActionTitle = (policyArea: string, actionText: string | null): string => {
  const a = (actionText ?? "").toLowerCase();
  if (a.includes("became public law") || a.includes("signed by president"))
    return `Signed into law: ${policyArea}`;
  if (a.includes("passed") || a.includes("agreed to") || a.includes("adopted"))
    return `Vote passed: ${policyArea}`;
  if (a.includes("failed") || a.includes("rejected") || a.includes("not agreed to"))
    return `Vote failed: ${policyArea}`;
  if (a.includes("introduced") || a.includes("referred to"))
    return `New bill: ${policyArea}`;
  return `${policyArea}: Recent update`;
};

// ── Check 1: New bills in followed policy areas / states ──────────────────────
// Uses Railway SQLite bills table — no Congress.gov API needed

const checkNewBills = async (filterToken?: string) => {
  console.log("Checking for new bills...");
  const registrations = getAllRegistrations(filterToken);
  const messages: { to: string; title: string; body: string; data?: any }[] =
    [];
  const since = getLastChecked();

  const recentBills = db
    .prepare(
      `SELECT bill_id, type, number, title, policy_area, sponsor_state, latest_action_text
     FROM bills
     WHERE latest_action_date >= ?
       AND type IN ('HR', 'S')
       AND policy_area IS NOT NULL`,
    )
    .all(since) as {
    bill_id: string;
    type: string;
    number: string;
    title: string;
    policy_area: string;
    sponsor_state: string | null;
    latest_action_text: string | null;
  }[];

  console.log(`Found ${recentBills.length} recent bills since ${since}`);

  for (const reg of registrations) {
    const followedPolicyAreas: string[] = JSON.parse(reg.policy_areas || "[]");
    const followedStates: string[] = JSON.parse(reg.followed_states || "[]");

    if (followedPolicyAreas.length === 0 && followedStates.length === 0)
      continue;

    // Track per-area and per-state caps
    const policyAreaCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};

    for (const bill of recentBills) {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;

      // Policy area notifications — cap at 4 per area per day
      if (
        followedPolicyAreas.includes(bill.policy_area) &&
        (policyAreaCounts[bill.policy_area] ?? 0) < 4
      ) {
        messages.push({
          to: reg.token,
          title: billActionTitle(bill.policy_area, bill.latest_action_text),
          body: bill.title,
          data: { billId },
        });
        policyAreaCounts[bill.policy_area] =
          (policyAreaCounts[bill.policy_area] ?? 0) + 1;
        continue; // Don't double-notify if also matches state
      }

      // State notifications — cap at 4 per state per day
      if (bill.sponsor_state) {
        const matchedState = followedStates.find(
          (s) => STATE_ABBR[s] === bill.sponsor_state,
        );
        if (matchedState && (stateCounts[matchedState] ?? 0) < 4) {
          messages.push({
            to: reg.token,
            title: billActionTitle(matchedState, bill.latest_action_text),
            body: bill.title,
            data: { billId },
          });
          stateCounts[matchedState] = (stateCounts[matchedState] ?? 0) + 1;
        }
      }
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const deduped = messages.filter((msg) => {
    const billId = msg.data?.billId;
    if (!billId) return true;
    const already = db
      .prepare(
        `SELECT 1 FROM notified_bills WHERE token = ? AND bill_id = ? AND notified_date = ?`,
      )
      .get(msg.to, billId, today);
    return !already;
  });

  const insert = db.prepare(
    `INSERT OR IGNORE INTO notified_bills (token, bill_id, notified_date) VALUES (?, ?, ?)`,
  );
  db.transaction(() => {
    for (const msg of deduped) {
      if (msg.data?.billId) insert.run(msg.to, msg.data.billId, today);
    }
  })();

  await sendNotifications(deduped);
  console.log(
    `Sent ${deduped.length} new bill notifications (${messages.length - deduped.length} deduplicated)`,
  );
};

// ── Check 2: Status changes on followed bills ─────────────────────────────────

const checkFollowedBills = async (filterToken?: string) => {
  console.log("Checking followed bills for updates...");
  const registrations = getAllRegistrations(filterToken);
  const messages: { to: string; title: string; body: string; data?: any }[] =
    [];

  for (const reg of registrations) {
    const followedBills: { billId: string; subTypes: string[] }[] = JSON.parse(
      reg.followed_bills || "[]",
    );
    if (followedBills.length === 0) continue;

    for (const { billId: rawBillId, subTypes } of followedBills) {
      const billId = rawBillId.replace(/^bill_/, "");
      const wantsActions =
        subTypes.includes("all-notications") || subTypes.includes("actions");
      const wantsVoting =
        subTypes.includes("all-notications") || subTypes.includes("voting");

      const wantsCosponsors =
        subTypes.includes("all-notications") || subTypes.includes("cosponsors");
      const wantsAmendments =
        subTypes.includes("all-notications") || subTypes.includes("amendments");
      if (!wantsActions && !wantsVoting && !wantsCosponsors && !wantsAmendments)
        continue;
      try {
        const match = billId.match(/^([a-z]+)(\d+)$/i);
        if (!match) continue;
        const billType = match[1].toLowerCase();
        const billNumber = match[2];
        const since = getLastChecked();

        if (wantsActions) {
          const actionsRes = await axios.get(
            `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/actions`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recentActions = (actionsRes.data.actions || []).filter(
            (a: any) => a.actionDate >= since,
          );
          console.log(
            `Bill ${billId} actions:`,
            actionsRes.data.actions?.slice(0, 2).map((a: any) => a.actionDate),
          );
          for (const action of recentActions) {
            messages.push({
              to: reg.token,
              title: `${billId.toUpperCase()} had a new action`,
              body: action.text,
              data: { billId, notifType: "actions" },
            });
          }
        }

        if (wantsVoting) {
          const actionsRes = await axios.get(
            `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/actions`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recentVotes = (actionsRes.data.actions || []).filter(
            (a: any) => a.actionDate >= since && a.recordedVotes?.length > 0,
          );
          console.log(
            `Bill ${billId} votes:`,
            actionsRes.data.actions?.slice(0, 2).map((a: any) => a.actionDate),
          );
          for (const action of recentVotes) {
            messages.push({
              to: reg.token,
              title: `Vote recorded on ${billId.toUpperCase()}`,
              body: action.text,
              data: { billId, notifType: "voting" },
            });
          }
        }

        if (wantsCosponsors) {
          const cosponsorsRes = await axios.get(
            `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/cosponsors`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recentCosponsors = (cosponsorsRes.data.cosponsors || []).filter(
            (c: any) => c.sponsorshipDate >= since,
          );
          if (recentCosponsors.length > 0) {
            messages.push({
              to: reg.token,
              title: `${billId.toUpperCase()} received a new cosponsor`,
              body: recentCosponsors
                .map(
                  (c: any) =>
                    `${c.firstName} ${c.lastName} (${c.party}-${c.state})`,
                )
                .join(", "),
              data: { billId, notifType: "cosponsors" },
            });
          }
        }
        if (wantsAmendments) {
          const amendmentsRes = await axios.get(
            `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/amendments`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recentAmendments = (amendmentsRes.data.amendments || []).filter(
            (a: any) => a.updateDate >= since,
          );
          if (recentAmendments.length > 0) {
            messages.push({
              to: reg.token,
              title: `${billId.toUpperCase()} has a new amendment`,
              body:
                recentAmendments.length === 1
                  ? `1 new amendment submitted`
                  : `${recentAmendments.length} new amendments submitted`,
              data: { billId, notifType: "amendments" },
            });
          }
        }
      } catch (error) {
        console.error(`Error checking bill ${billId}:`, error);
      }
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const deduped = messages.filter((msg) => {
    const billId = msg.data?.billId;
    const notifType = msg.data?.notifType;
    if (!billId || !notifType) return true;
    const already = db
      .prepare(
        `SELECT 1 FROM notified_bills WHERE token = ? AND bill_id = ? AND notified_date = ?`,
      )
      .get(msg.to, `${billId}-${notifType}`, today);
    return !already;
  });

  const insert = db.prepare(
    `INSERT OR IGNORE INTO notified_bills (token, bill_id, notified_date) VALUES (?, ?, ?)`,
  );
  db.transaction(() => {
    for (const msg of deduped) {
      if (msg.data?.billId && msg.data?.notifType) {
        insert.run(msg.to, `${msg.data.billId}-${msg.data.notifType}`, today);
      }
    }
  })();

  await sendNotifications(deduped);
  console.log(
    `Sent ${deduped.length} followed bill notifications (${messages.length - deduped.length} deduplicated)`,
  );
};

// ── Resolve a stored official name that may be a raw bioguideId ───────────────
// If the sync previously stored the bioguideId as the name (name lookup failed
// on device), we recover the real name from the officials-all SQLite cache.
const BIOGUIDE_RE = /^[A-Z][0-9A-Z]{6}$/;

const resolveOfficialName = (bioguideId: string, storedName: string): string => {
  if (storedName && !BIOGUIDE_RE.test(storedName)) return storedName;
  try {
    const row = db
      .prepare(`SELECT data FROM congress_cache WHERE cache_key = 'officials-all' LIMIT 1`)
      .get() as { data: string } | undefined;
    if (!row) return storedName || bioguideId;
    const officials: any[] = JSON.parse(row.data)?.officials ?? [];
    const found = officials.find((o: any) => o.bioguideId === bioguideId);
    if (!found?.name) return storedName || bioguideId;
    const n: string = found.name;
    return n.includes(",")
      ? n.split(",").reverse().map((s: string) => s.trim()).join(" ")
      : n;
  } catch {
    return storedName || bioguideId;
  }
};

// ── Check 3: Activity from followed officials ─────────────────────────────────

const checkFollowedOfficials = async (filterToken?: string) => {
  console.log("Checking followed officials for updates...");
  const registrations = getAllRegistrations(filterToken);
  const messages: { to: string; title: string; body: string; data?: any }[] =
    [];
  const since = getLastChecked();

  for (const reg of registrations) {
    const followedOfficials: {
      bioguideId: string;
      name: string;
      subTypes: string[];
    }[] = JSON.parse(reg.followed_officials || "[]");
    if (followedOfficials.length === 0) continue;

    for (const {
      bioguideId: rawId,
      name: rawOfficialName,
      subTypes,
    } of followedOfficials) {
      const bioguideId = rawId.replace(/^official_/, "");
      const officialName = resolveOfficialName(bioguideId, rawOfficialName);
      const wantsSponsored =
        subTypes.includes("all-notications") ||
        subTypes.includes("bills-introduced");
      const wantsCosponsored =
        subTypes.includes("all-notications") ||
        subTypes.includes("bills-cosponsored");

      if (!wantsSponsored && !wantsCosponsored) continue;

      try {
        if (wantsSponsored) {
          const res = await axios.get(
            `https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recent = (res.data.sponsoredLegislation || []).filter(
            (b: any) => b.introducedDate >= since && b.type && b.number,
          );
          for (const bill of recent) {
            const billId = `${bill.type.toLowerCase()}${bill.number}`;
            messages.push({
              to: reg.token,
              title: `${officialName} introduced a new bill`,
              body: bill.title ?? "No title",
              data: { billId, officialId: bioguideId, notifType: "introduced" },
            });
          }
        }

        if (wantsCosponsored) {
          const res = await axios.get(
            `https://api.congress.gov/v3/member/${bioguideId}/cosponsored-legislation`,
            {
              headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
              params: { limit: 10 },
            },
          );
          const recent = (res.data.cosponsoredLegislation || []).filter(
            (b: any) => b.introducedDate >= since && b.type && b.number,
          );
          for (const bill of recent) {
            const billId = `${bill.type.toLowerCase()}${bill.number}`;
            messages.push({
              to: reg.token,
              title: `${officialName} cosponsored a bill`,
              body: bill.title ?? "No title",
              data: { billId, officialId: bioguideId, notifType: "cosponsored" },
            });
          }
        }
      } catch (error) {
        console.error(`Error checking official ${bioguideId}:`, error);
      }
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const deduped = messages.filter((msg) => {
    const billId = msg.data?.billId;
    const notifType = msg.data?.notifType;
    if (!billId || !notifType) return true;
    const already = db
      .prepare(
        `SELECT 1 FROM notified_bills WHERE token = ? AND bill_id = ? AND notified_date = ?`,
      )
      .get(msg.to, `${billId}-${notifType}`, today);
    return !already;
  });

  const insert = db.prepare(
    `INSERT OR IGNORE INTO notified_bills (token, bill_id, notified_date) VALUES (?, ?, ?)`,
  );
  db.transaction(() => {
    for (const msg of deduped) {
      if (msg.data?.billId && msg.data?.notifType) {
        insert.run(msg.to, `${msg.data.billId}-${msg.data.notifType}`, today);
      }
    }
  })();

  await sendNotifications(deduped);
  console.log(
    `Sent ${deduped.length} followed official notifications (${messages.length - deduped.length} deduplicated)`,
  );
};

// ── Pre-warm member legislation cache ─────────────────────────────────────────

const PREWARM_FRESHNESS_MS = 22 * 60 * 60 * 1000; // refresh if > 22h old (matches 24h backend TTL)
const PREWARM_BATCH_LIMIT = 20; // max officials to refresh per cron run

const fetchMemberLegislationFull = async (
  bioguideId: string,
  endpoint: "sponsored-legislation" | "cosponsored-legislation",
  dataKey: "sponsoredLegislation" | "cosponsoredLegislation",
): Promise<{ legislation: any[]; count: number }> => {
  let allLegislation: any[] = [];
  let offset = 0;
  const limit = 250;
  let allTimeCount = 0;

  const firstPage = await axios.get(
    `https://api.congress.gov/v3/member/${bioguideId}/${endpoint}`,
    {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: { limit, offset, format: "json" },
      timeout: 15000,
    },
  );
  allTimeCount = firstPage.data.pagination?.count ?? 0;
  const firstItems: any[] = firstPage.data[dataKey] || [];
  allLegislation = allLegislation.concat(
    firstItems.filter((b: any) => b.congress === 119),
  );

  const hasOlderFirst = firstItems.some(
    (b: any) => b.congress !== undefined && b.congress < 119,
  );
  let hasMore = !!firstPage.data.pagination?.next && !hasOlderFirst;
  offset += limit;

  while (hasMore) {
    const response = await axios.get(
      `https://api.congress.gov/v3/member/${bioguideId}/${endpoint}`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { limit, offset, format: "json" },
        timeout: 15000,
      },
    );
    const page: any[] = response.data[dataKey] || [];
    allLegislation = allLegislation.concat(
      page.filter((b: any) => b.congress === 119),
    );
    const hasOlder = page.some(
      (b: any) => b.congress !== undefined && b.congress < 119,
    );
    hasMore = !!response.data.pagination?.next && page.length === limit && !hasOlder;
    offset += limit;
  }

  return { legislation: allLegislation, count: allTimeCount };
};

const writeLegislationCache = (key: string, data: any): void => {
  db.prepare(
    `INSERT INTO congress_cache (cache_key, data, cached_at) VALUES (?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET data = excluded.data, cached_at = excluded.cached_at`,
  ).run(key, JSON.stringify(data), Date.now());
};

const prewarmFollowedOfficials = async (): Promise<void> => {
  const registrations = getAllRegistrations();
  const officialIds = new Set<string>();
  for (const reg of registrations) {
    const followed: { bioguideId: string }[] = JSON.parse(
      reg.followed_officials || "[]",
    );
    for (const o of followed) {
      const id = o.bioguideId.replace(/^official_/, "");
      if (/^[A-Z][0-9A-Z]{6}$/.test(id)) officialIds.add(id);
    }
  }

  const stale = [...officialIds]
    .filter((id) => {
      const row = db
        .prepare(`SELECT cached_at FROM congress_cache WHERE cache_key = ?`)
        .get(`sponsored-${id}`) as { cached_at: number } | undefined;
      return !row || Date.now() - row.cached_at > PREWARM_FRESHNESS_MS;
    })
    .slice(0, PREWARM_BATCH_LIMIT);

  if (stale.length === 0) {
    console.log("Member legislation cache: all followed officials are fresh.");
    return;
  }
  console.log(`Pre-warming legislation cache for ${stale.length} officials...`);

  for (const bioguideId of stale) {
    try {
      const [sponsored, cosponsored] = await Promise.all([
        fetchMemberLegislationFull(bioguideId, "sponsored-legislation", "sponsoredLegislation"),
        fetchMemberLegislationFull(bioguideId, "cosponsored-legislation", "cosponsoredLegislation"),
      ]);
      writeLegislationCache(`sponsored-${bioguideId}`, sponsored);
      writeLegislationCache(`cosponsored-${bioguideId}`, cosponsored);
      console.log(`  Cached ${bioguideId}: ${sponsored.legislation.length} sponsored, ${cosponsored.legislation.length} cosponsored`);
    } catch (err) {
      console.warn(`  Pre-warm failed for ${bioguideId}:`, err);
    }
  }
  console.log("Pre-warming complete.");
};

// ── Main runner ───────────────────────────────────────────────────────────────

const enrichMissingPolicyAreas = async (): Promise<void> => {
  const billsToEnrich = db
    .prepare(
      `
    SELECT bill_id, type, number
    FROM bills
    WHERE policy_area IS NULL
      AND latest_action_date >= date('now', '-7 days')
      AND type IN ('HR', 'S')
    LIMIT 50
  `,
    )
    .all() as { bill_id: string; type: string; number: string }[];

  if (billsToEnrich.length === 0) return;
  console.log(
    `Enriching ${billsToEnrich.length} bills missing policy areas...`,
  );

  const update = db.prepare(
    `UPDATE bills SET policy_area = ? WHERE bill_id = ?`,
  );

  for (const bill of billsToEnrich) {
    try {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/119/${bill.type.toLowerCase()}/${bill.number}`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          timeout: 15000,
        },
      );
      const policyArea = response.data?.bill?.policyArea?.name ?? null;
      if (policyArea) {
        update.run(policyArea, bill.bill_id);
      }
      await new Promise((res) => setTimeout(res, 100));
    } catch {
      // Skip failed bills silently
    }
  }

  console.log(`Policy area enrichment complete.`);
};

const syncRecentBills = async (): Promise<void> => {
  try {
    const since = getLastChecked();
    const response = await axios.get("https://api.congress.gov/v3/bill/119", {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: {
        limit: 250,
        sort: "updateDate+desc",
        format: "json",
        fromDateTime: `${since}T00:00:00Z`,
      },
      timeout: 15000,
    });

    const bills = response.data.bills || [];
    const insert = db.prepare(`
      INSERT INTO bills (bill_id, type, number, title, policy_area, sponsor_state, update_date, latest_action_date, latest_action_text, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(bill_id) DO UPDATE SET
        title = excluded.title,
        sponsor_state = excluded.sponsor_state,
        update_date = excluded.update_date,
        latest_action_date = excluded.latest_action_date,
        latest_action_text = excluded.latest_action_text,
        synced_at = excluded.synced_at,
        policy_area = COALESCE(excluded.policy_area, bills.policy_area)
    `);

    const sync = db.transaction((bills: any[]) => {
      for (const bill of bills) {
        insert.run(
          `${bill.type.toLowerCase()}${bill.number}`,
          bill.type,
          bill.number,
          bill.title,
          bill.policyArea?.name ?? null,
          bill.sponsors?.[0]?.state ?? null,
          bill.updateDate ?? null,
          bill.latestAction?.actionDate ?? null,
          bill.latestAction?.text ?? null,
          Date.now(),
        );
      }
    });
    sync(bills);
    console.log(`Synced ${bills.length} recent bills to SQLite`);
  } catch (error) {
    console.warn("Background bill sync failed:", error);
  }
};

export const runCronJob = async () => {
  db.prepare(
    `DELETE FROM notified_bills WHERE notified_date < date('now', '-3 days')`,
  ).run();
  // Clean up congress_cache entries older than 48h (covers both TTL tiers)
  db.prepare(`DELETE FROM congress_cache WHERE cached_at < ?`).run(
    Date.now() - 48 * 60 * 60 * 1000,
  );
  console.log(
    "Running daily notification cron job...",
    new Date().toISOString(),
  );
  await syncRecentBills();
  await enrichMissingPolicyAreas();
  await prewarmFollowedOfficials();
  await checkNewBills();
  await checkFollowedBills();
  await checkFollowedOfficials();
  console.log("Cron job complete.");
};

export const runCronJobForToken = async (token: string) => {
  console.log(`Running single-token cron test for ${token}`, new Date().toISOString());
  await syncRecentBills();
  await enrichMissingPolicyAreas();
  await checkNewBills(token);
  await checkFollowedBills(token);
  await checkFollowedOfficials(token);
  console.log("Single-token cron test complete.");
};

// ── Scheduler — runs every day at 8am and 4pm EST ─────────────────────────────────
export const startCronScheduler = () => {
  cron.schedule("0 13,21 * * *", () => {
    // cron.schedule("*/30 * * * *", () => {
    runCronJob();
  });
  console.log("Cron scheduler started — runs at 8am and 4pm EST daily");
  // console.log("Cron scheduler started — runs every 30 minutes");
};
