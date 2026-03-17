import axios from "axios";
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const sendNotifications = async (
  messages: { to: string; title: string; body: string; data?: any }[],
) => {
  if (messages.length === 0) return;
  // Expo push API accepts up to 100 messages per request
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

// const getLastChecked = (): string => {
//   // Returns yesterday's date in YYYY-MM-DD format as default
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   return yesterday.toISOString().split("T")[0];
// };

const getLastChecked = (): string => {
  return "2025-01-01";
};

// ── Check 1: New bills in followed policy areas / states ──────────────────────

const checkNewBills = async () => {
  console.log("Checking for new bills...");
  const registrations = getAllRegistrations();
  if (registrations.length === 0) return;

  const since = getLastChecked();
  const messages: { to: string; title: string; body: string; data?: any }[] =
    [];

  try {
    // Fetch bills introduced in the last day
    const response = await axios.get("https://api.congress.gov/v3/bill/119", {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: {
        limit: 250,
        sort: "introducedDate+desc",
        fromDateTime: `${since}T00:00:00Z`,
      },
    });

    const newBills = (response.data.bills || []).filter(
      (b: any) => b.congress === 119 && b.updateDate >= since,
    );
    console.log(`Found ${newBills.length} new bills since ${since}`);

    if (newBills.length === 0) return;

    for (const reg of registrations) {
      const policyAreas: string[] = JSON.parse(reg.policy_areas || "[]");
      const followedStates: string[] = JSON.parse(reg.followed_states || "[]");

      for (const bill of newBills) {
        const billPolicyArea = bill.policyArea?.name;
        const billState = bill.sponsors?.[0]?.state;

        const matchesPolicyArea =
          billPolicyArea && policyAreas.includes(billPolicyArea);
        const followedStateAbbrs = followedStates.map(
          (s: string) => STATE_ABBR[s] ?? s,
        );
        const matchesState =
          billState && followedStateAbbrs.includes(billState);
        if (matchesPolicyArea || matchesState) {
          const reason = matchesPolicyArea
            ? billPolicyArea
            : `${billState} delegation`;
          const stateFullName =
            Object.entries(STATE_ABBR).find(
              ([, abbr]) => abbr === billState,
            )?.[0] ?? billState;
          const notifTitle = matchesPolicyArea
            ? `${billPolicyArea}: New Bill Introduced`
            : `New Bill from ${stateFullName}`;
          const notifBody = `${bill.type}.${bill.number} — ${bill.title}`;

          messages.push({
            to: reg.token,
            title: notifTitle,
            body: notifBody,
            data: { billId: `${bill.type.toLowerCase()}${bill.number}` },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking new bills:", error);
  }

  await sendNotifications(messages);
  console.log(`Sent ${messages.length} new bill notifications`);
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

      if (!wantsActions && !wantsVoting) continue;

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
          for (const action of recentActions) {
            messages.push({
              to: reg.token,
              title: `${billId.toUpperCase()} Update`,
              body: action.text,
              data: { billId },
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
          for (const action of recentVotes) {
            messages.push({
              to: reg.token,
              title: `Vote Recorded: ${billId.toUpperCase()}`,
              body: action.text,
              data: { billId },
            });
          }
        }
      } catch (error) {
        console.error(`Error checking bill ${billId}:`, error);
      }
    }
  }

  await sendNotifications(messages);
  console.log(`Sent ${messages.length} followed bill notifications`);
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
              title: `${officialName} sponsored a new bill`,
              body: `${bill.type ?? ""}${bill.number} - ${bill.title}`,
              data: {
                billId: `${bill.type?.toLowerCase() ?? ""}${bill.number}`,
                officialId: bioguideId,
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
              title: `${officialName} cosponsored a new bill`,
              body: `${bill.type ?? ""}${bill.number} - ${bill.title}`,
              data: {
                billId: `${bill.type?.toLowerCase() ?? ""}${bill.number}`,
                officialId: bioguideId,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error checking official ${bioguideId}:`, error);
      }
    }
  }

  await sendNotifications(messages);
  console.log(`Sent ${messages.length} followed official notifications`);
};

// ── Main runner ───────────────────────────────────────────────────────────────

export const runCronJob = async () => {
  console.log(
    "Running daily notification cron job...",
    new Date().toISOString(),
  );
  await checkNewBills();
  await checkFollowedBills();
  await checkFollowedOfficials();
  console.log("Cron job complete.");
};
