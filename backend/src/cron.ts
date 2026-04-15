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
      await axios.post(EXPO_PUSH_URL, chunk, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }
};

const getAllRegistrations = () => {
  return db.prepare("SELECT * FROM push_registrations").all() as {
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
//   return "2025-01-01";
// };

// ── Check 1: New bills in followed policy areas / states ──────────────────────
// Uses Railway SQLite bills table — no Congress.gov API needed

const checkNewBills = async () => {
  console.log("Checking for new bills...");
  const registrations = getAllRegistrations();
  const messages: { to: string; title: string; body: string; data?: any }[] =
    [];
  const since = getLastChecked();

  // Query only HR and S bills with a policy area, updated since yesterday
  const recentBills = db
    .prepare(
      `SELECT bill_id, type, number, title, policy_area, sponsor_state
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
    update_date: string | null; // ADD THIS LINE
  }[];

  console.log(`Found ${recentBills.length} recent bills since ${since}`);
  console.log(
    `Sample update_dates:`,
    (recentBills as any[]).slice(0, 3).map((b) => b.update_date),
  );

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
          title: `${bill.policy_area}: Recent update`,
          body: `${bill.type}.${bill.number} — ${bill.title}`,
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
            title: `New bill from ${matchedState}`,
            body: `${bill.type}.${bill.number} — ${bill.title}`,
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

const checkFollowedBills = async () => {
  console.log("Checking followed bills for updates...");
  const registrations = getAllRegistrations();
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

// ── Check 3: Activity from followed officials ─────────────────────────────────

const checkFollowedOfficials = async () => {
  console.log("Checking followed officials for updates...");
  const registrations = getAllRegistrations();
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
      name: officialName,
      subTypes,
    } of followedOfficials) {
      const bioguideId = rawId.replace(/^official_/, "");
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
            (b: any) => b.introducedDate >= since,
          );
          for (const bill of recent) {
            messages.push({
              to: reg.token,
              title: `${officialName} introduced a new bill`,
              body: `${bill.type ?? ""}.${bill.number} — ${bill.title}`,
              data: {
                billId: `${bill.type?.toLowerCase() ?? ""}${bill.number}`,
                officialId: bioguideId,
                notifType: "introduced",
              },
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
            (b: any) => b.introducedDate >= since,
          );
          for (const bill of recent) {
            messages.push({
              to: reg.token,
              title: `${officialName} cosponsored a bill`,
              body: `${bill.type ?? ""}.${bill.number} — ${bill.title}`,
              data: {
                billId: `${bill.type?.toLowerCase() ?? ""}${bill.number}`,
                officialId: bioguideId,
                notifType: "cosponsored",
              },
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
        { headers: { "X-Api-Key": process.env.CONGRESS_API_KEY } },
      );
      const policyArea = response.data?.bill?.policyArea?.name ?? null;
      if (policyArea) {
        update.run(policyArea, bill.bill_id);
      }
      // Small delay to avoid rate limiting
      await new Promise((res) => setTimeout(res, 100));
    } catch {
      // Skip failed bills silently
    }
  }

  console.log(`Policy area enrichment complete.`);
};

export const runCronJob = async () => {
  db.prepare(
    `DELETE FROM notified_bills WHERE notified_date < date('now', '-1 days')`,
  ).run();
  console.log(
    "Running daily notification cron job...",
    new Date().toISOString(),
  );
  await enrichMissingPolicyAreas();
  await checkNewBills();
  await checkFollowedBills();
  await checkFollowedOfficials();
  console.log("Cron job complete.");
};

// ── Scheduler — runs every day at 8am and 4pm EST ─────────────────────────────────
export const startCronScheduler = () => {
  cron.schedule("0 13,21 * * *", () => {
    runCronJob();
  });
  console.log("Cron scheduler started — runs at 8am and 4pm EST daily");
};
