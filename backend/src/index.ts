import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import { runCronJob, startCronScheduler } from "./cron";
import db from "./db";

dotenv.config();

const app = express();
app.set("trust proxy", 1); // trust Railway's proxy
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(globalLimiter);

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

let billsCache: { data: any; timestamp: number } | null = null;
const BILLS_CACHE_TTL = 60 * 60 * 1000;

app.get("/api/bills", async (req, res) => {
  const since = req.query.since as string | undefined;

  // Delta sync: if ?since=date is provided, skip cache and fetch only updated bills
  if (!since) {
    if (billsCache && Date.now() - billsCache.timestamp < BILLS_CACHE_TTL) {
      return res.json(billsCache.data);
    }
  }

  try {
    const fetchBills = async (sort: string, since?: string) => {
      let bills: any[] = [];
      let offset = 0;
      const limit = 250;

      while (true) {
        const params: any = { limit, offset, sort, format: "json" };
        if (since) params.fromDateTime = `${since}T00:00:00Z`;

        const response = await axios.get(
          "https://api.congress.gov/v3/bill/119",
          {
            headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
            params,
          },
        );

        const page = response.data.bills || [];
        bills = bills.concat(page);

        if (!response.data.pagination?.next || page.length < limit) break;

        // For delta sync, stop after first page if bills are older than since
        if (since && page.length > 0) {
          const lastBill = page[page.length - 1];
          if (lastBill.updateDate < since) break;
        }

        offset += limit;
      }

      return bills;
    };

    // Fetch all bills sorted both ways to maximize coverage
    // Run sequentially to avoid hammering the API
    const byUpdateDate = await fetchBills("updateDate+desc", since);
    const byIntroducedDate = since
      ? []
      : await fetchBills("introducedDate+desc");

    const seen = new Set<string>();
    const merged = [...byUpdateDate, ...byIntroducedDate]
      .filter((bill) => bill.congress === 119)
      .filter((bill) => {
        const key = `${bill.type}${bill.number}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const responseData = {
      bills: merged.map((bill, index) => ({ ...bill, _apiOrder: index })),
      pagination: { count: merged.length },
    };

    if (!since) {
      billsCache = { data: responseData, timestamp: Date.now() };
    }

    // Sync bills into Railway SQLite for cron use
    try {
      const insert = db.prepare(`
          INSERT INTO bills (bill_id, type, number, title, policy_area, sponsor_state, update_date, latest_action_date, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(bill_id) DO UPDATE SET
            title = excluded.title,
            sponsor_state = excluded.sponsor_state,
            update_date = excluded.update_date,
            latest_action_date = excluded.latest_action_date,
            synced_at = excluded.synced_at,
            policy_area = COALESCE(bills.policy_area, excluded.policy_area)
        `);
      const syncBills = db.transaction((bills: any[]) => {
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
            Date.now(),
          );
        }
      });
      syncBills(merged);
    } catch (err) {
      console.error("Bill sync to SQLite failed:", err);
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

app.get("/api/bills/search", async (req, res) => {
  try {
    const query = (req.query.q as string)?.trim();
    if (!query) return res.status(400).json({ error: "Query required" });

    // Check if it looks like a bill number e.g. "hr4405", "s2503", "hres353"
    const billIdMatch = query.match(/^([a-z]+)(\d+)$/i);

    if (billIdMatch) {
      // Direct bill lookup by type+number
      const billType = billIdMatch[1].toLowerCase();
      const billNumber = billIdMatch[2];

      const response = await axios.get(
        `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { format: "json" },
        },
      );

      if (response.data?.bill) {
        return res.json({ bills: [response.data.bill], count: 1 });
      }
      return res.json({ bills: [], count: 0 });
    }

    // Keyword search — search by title
    const response = await axios.get("https://api.congress.gov/v3/bill/119", {
      headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
      params: {
        limit: 50,
        query,
        format: "json",
      },
    });

    const bills = (response.data.bills || []).filter(
      (b: any) => b.congress === 119,
    );

    res.json({ bills, count: bills.length });
  } catch (error) {
    console.error("Error searching bills:", error);
    res.status(500).json({ error: "Failed to search bills" });
  }
});

const POLICY_AREAS_STATIC: Record<
  string,
  string
> = require("./policyAreas.json");

app.get("/api/bills/policy-areas", (req, res) => {
  res.json(POLICY_AREAS_STATIC);
});

app.get("/api/bills/enrich-status", (req, res) => {
  try {
    const total = db.prepare(`SELECT COUNT(*) as count FROM bills`).get() as {
      count: number;
    };
    const withState = db
      .prepare(
        `SELECT COUNT(*) as count FROM bills WHERE sponsor_state IS NOT NULL`,
      )
      .get() as { count: number };
    const withPolicy = db
      .prepare(
        `SELECT COUNT(*) as count FROM bills WHERE policy_area IS NOT NULL`,
      )
      .get() as { count: number };
    res.json({
      total: total.count,
      withState: withState.count,
      withPolicy: withPolicy.count,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to check enrich status" });
  }
});

app.post("/api/bills/enrich", (req, res) => {
  try {
    const { bills } = req.body as {
      bills: {
        billId: string;
        sponsorState: string | null;
        policyArea: string | null;
      }[];
    };

    const update = db.prepare(`
      UPDATE bills SET sponsor_state = ?, policy_area = COALESCE(policy_area, ?)
      WHERE bill_id = ?
    `);

    const updateAll = db.transaction((bills: any[]) => {
      for (const bill of bills) {
        update.run(bill.sponsorState, bill.policyArea, bill.billId);
      }
    });

    updateAll(bills);
    res.json({ success: true, updated: bills.length });
  } catch (error) {
    console.error("Error enriching bills:", error);
    res.status(500).json({ error: "Failed to enrich bills" });
  }
});

// Get single bill by ID
app.get("/api/bills/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    const response = await axios.get(
      `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { format: "json" },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Failed to fetch bill details" });
  }
});

// Get bill summaries
app.get("/api/bills/:billId/summaries", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    const response = await axios.get(
      `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/summaries`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { format: "json" },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Failed to fetch bill summaries" });
  }
});

// Get bill actions
app.get("/api/bills/:billId/actions", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    let allActions: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/actions`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { offset, limit, format: "json" },
        },
      );
      allActions = allActions.concat(response.data.actions || []);
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    res.json({ actions: allActions, pagination: { count: allActions.length } });
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ error: "Failed to fetch bill actions" });
  }
});

// Get bill amendments
app.get("/api/bills/:billId/amendments", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    let allAmendments: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/amendments`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { offset, limit, format: "json" },
        },
      );
      allAmendments = allAmendments.concat(response.data.amendments || []);
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    res.json({
      amendments: allAmendments,
      pagination: { count: allAmendments.length },
    });
  } catch (error) {
    console.error("Error fetching amendments:", error);
    res.status(500).json({ error: "Failed to fetch bill amendments" });
  }
});

// Get single amendment details
app.get("/api/amendments/:amendmentType/:amendmentNumber", async (req, res) => {
  try {
    const { amendmentType, amendmentNumber } = req.params;
    const congress = (req.query.congress as string) || "119";

    const response = await axios.get(
      `https://api.congress.gov/v3/amendment/${congress}/${amendmentType.toLowerCase()}/${amendmentNumber}`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { format: "json" },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching amendment:", error);
    res.status(500).json({ error: "Failed to fetch amendment details" });
  }
});

// Get bill votes
app.get("/api/bills/:billId/votes", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    let allActions: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/actions`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { offset, limit, format: "json" },
        },
      );
      allActions = allActions.concat(response.data.actions || []);
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    const recordedVotes: any[] = [];
    for (const action of allActions) {
      if (action.recordedVotes?.length) {
        for (const vote of action.recordedVotes) {
          recordedVotes.push({
            url: vote.url,
            chamber: vote.chamber,
            date: vote.date,
            rollNumber: vote.rollNumber,
            actionText: action.text,
          });
        }
      }
    }

    if (recordedVotes.length === 0) {
      const voiceVotes = allActions
        .filter(
          (a: any) =>
            !a.recordedVotes?.length &&
            a.text &&
            (a.text.toLowerCase().includes("voice vote") ||
              a.text.toLowerCase().includes("agreed to") ||
              a.text.toLowerCase().includes("passed without") ||
              a.text.toLowerCase().includes("unanimous consent")),
        )
        .map((a: any) => ({
          date: a.actionDate,
          text: a.text,
          chamber: (() => {
            const src = a.sourceSystem?.name?.toLowerCase() ?? "";
            const txt = (a.text ?? "").toLowerCase();
            if (
              src.includes("house") ||
              txt.includes("in the house") ||
              txt.includes("in house") ||
              a.sourceSystem?.code === 2
            )
              return "House";
            if (
              src.includes("senate") ||
              txt.includes("in the senate") ||
              txt.includes("in senate") ||
              a.sourceSystem?.code === 1
            )
              return "Senate";
            return "";
          })(),
        }));
      return res.json({ votes: [], voiceVotes });
    }
    const seen = new Set<string>();
    const uniqueVotes = recordedVotes.filter((v) => {
      const key = `${v.chamber}-${v.rollNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const parseVoteXml = (xml: string, meta: any) => {
      let members: {
        firstName: string;
        lastName: string;
        party: string;
        vote: string;
      }[] = [];
      const get = (tag: string) => {
        const m = xml.match(
          new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
        );
        return m ? m[1].trim() : "";
      };

      const isSenate =
        meta.chamber?.toLowerCase() === "senate" ||
        meta.url?.includes("senate.gov");

      let dem = { yea: 0, nay: 0, present: 0, notVoting: 0 };
      let rep = { yea: 0, nay: 0, present: 0, notVoting: 0 };
      let ind = { yea: 0, nay: 0, present: 0, notVoting: 0 };
      let title = meta.actionText || "";
      let result = "";
      let question = "";

      if (isSenate) {
        const memberBlocks = [
          ...xml.matchAll(/<member>([\s\S]*?)<\/member>/gi),
        ];
        for (const block of memberBlocks) {
          const inner = block[1];
          const party =
            inner.match(/<party>(.*?)<\/party>/i)?.[1]?.trim() ?? "";
          const voteCast =
            inner.match(/<vote_cast>(.*?)<\/vote_cast>/i)?.[1]?.trim() ?? "";
          const isYea = voteCast === "Yea";
          const isNay = voteCast === "Nay";
          const isPresent = voteCast === "Present";
          const isAbsent = voteCast === "Not Voting" || voteCast === "Absent";
          const firstName =
            inner.match(/<first_name>(.*?)<\/first_name>/i)?.[1]?.trim() ?? "";
          const lastName =
            inner.match(/<last_name>(.*?)<\/last_name>/i)?.[1]?.trim() ?? "";
          if (firstName || lastName) {
            members.push({ firstName, lastName, party, vote: voteCast });
          }
          if (party === "D") {
            dem.yea += isYea ? 1 : 0;
            dem.nay += isNay ? 1 : 0;
            dem.present += isPresent ? 1 : 0;
            dem.notVoting += isAbsent ? 1 : 0;
          } else if (party === "R") {
            rep.yea += isYea ? 1 : 0;
            rep.nay += isNay ? 1 : 0;
            rep.present += isPresent ? 1 : 0;
            rep.notVoting += isAbsent ? 1 : 0;
          } else if (party === "I") {
            ind.yea += isYea ? 1 : 0;
            ind.nay += isNay ? 1 : 0;
            ind.present += isPresent ? 1 : 0;
            ind.notVoting += isAbsent ? 1 : 0;
          }
        }
        result = get("vote_result").split("<")[0].trim();
        question = get("vote_question");
        title = get("vote_title") || title;
      } else {
        // Party totals
        const totalBlocks = [
          ...xml.matchAll(/<totals-by-party>([\s\S]*?)<\/totals-by-party>/gi),
        ];
        for (const block of totalBlocks) {
          const inner = block[1];
          const party =
            inner.match(/<party>(.*?)<\/party>/i)?.[1]?.trim() ?? "";
          const yea = parseInt(
            inner.match(/<yea-total>(\d+)<\/yea-total>/i)?.[1] ?? "0",
          );
          const nay = parseInt(
            inner.match(/<nay-total>(\d+)<\/nay-total>/i)?.[1] ?? "0",
          );
          const present = parseInt(
            inner.match(/<present-total>(\d+)<\/present-total>/i)?.[1] ?? "0",
          );
          const notVoting = parseInt(
            inner.match(/<not-voting-total>(\d+)<\/not-voting-total>/i)?.[1] ??
              "0",
          );
          if (party === "Democratic") dem = { yea, nay, present, notVoting };
          else if (party === "Republican")
            rep = { yea, nay, present, notVoting };
          else if (party === "Independent")
            ind = { yea, nay, present, notVoting };
        }

        // Individual member votes — House XML uses <recorded-vote> with <legislator> and <vote>
        const recordedVoteBlocks = [
          ...xml.matchAll(/<recorded-vote>([\s\S]*?)<\/recorded-vote>/gi),
        ];
        console.log(
          "House recorded-vote blocks found:",
          recordedVoteBlocks.length,
        );
        if (recordedVoteBlocks.length > 0) {
          console.log(
            "First block sample:",
            recordedVoteBlocks[0][1].slice(0, 200),
          );
        }
        for (const block of recordedVoteBlocks) {
          const inner = block[1];
          const nameAttr =
            inner.match(
              /<legislator[^>]*unaccented-name="([^"]*)"[^>]*>/i,
            )?.[1] ?? "";
          const party =
            inner
              .match(/<legislator[^>]*party="([^"]*)"[^>]*>/i)?.[1]
              ?.trim() ?? "";
          const voteCast =
            inner.match(/<vote>(.*?)<\/vote>/i)?.[1]?.trim() ?? "";

          // House XML stores full "Last, First" in unaccented-name attribute
          const nameParts = nameAttr.split(",").map((s: string) => s.trim());
          const lastName = nameParts[0] ?? "";
          const firstName = nameParts[1] ?? "";

          if (lastName) {
            members.push({ firstName, lastName, party, vote: voteCast });
          }
        }

        result = get("vote-result");
        question = get("vote-question");
        title = get("vote-desc") || get("legis-name") || title;
      }

      const total = {
        yea: dem.yea + rep.yea + ind.yea,
        nay: dem.nay + rep.nay + ind.nay,
        present: dem.present + rep.present + ind.present,
        notVoting: dem.notVoting + rep.notVoting + ind.notVoting,
      };
      const grandTotal =
        total.yea + total.nay + total.present + total.notVoting || 1;

      return {
        chamber: meta.chamber,
        date: meta.date,
        rollNumber: meta.rollNumber,
        question,
        result,
        title,
        democratic: dem,
        republican: rep,
        independent: ind,
        total,
        yeaPercent: Math.round((total.yea / grandTotal) * 100),
        nayPercent: Math.round((total.nay / grandTotal) * 100),
        presentPercent: Math.round((total.present / grandTotal) * 100),
        notVotingPercent: Math.round((total.notVoting / grandTotal) * 100),
        members,
      };
    };

    const voteResults = await Promise.allSettled(
      uniqueVotes.map(async (meta) => {
        const response = await axios.get(meta.url, {
          timeout: 8000,
          responseType: "text",
        });
        return parseVoteXml(response.data, meta);
      }),
    );

    const votes = voteResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    res.json({ votes, voiceVotes: [] });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Failed to fetch vote data" });
  }
});

// Get bill cosponsors
app.get("/api/bills/:billId/cosponsors", async (req, res) => {
  try {
    const { billId } = req.params;
    const congress = (req.query.congress as string) || "119";
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match)
      return res.status(400).json({ error: "Invalid bill ID format" });

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    let allCosponsors: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/cosponsors`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { offset, limit, format: "json" },
        },
      );
      allCosponsors = allCosponsors.concat(response.data.cosponsors || []);
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    const enriched = allCosponsors.map((c: any) => ({
      bioguideId: c.bioguideId,
      name: `${c.firstName} ${c.lastName}`,
      party: c.party,
      state: c.state,
      district: c.district ?? null,
      sponsorshipDate: c.sponsorshipDate,
      isOriginalCosponsor: c.isOriginalCosponsor,
      role: c.district ? `Rep, ${c.state} ${c.district}` : `Sen, ${c.state}`,
      photoUrl: `https://bioguide.congress.gov/bioguide/photo/${c.bioguideId[0]}/${c.bioguideId}.jpg`,
    }));

    res.json({ cosponsors: enriched, count: enriched.length });
  } catch (error) {
    console.error("Error fetching cosponsors:", error);
    res.status(500).json({ error: "Failed to fetch cosponsors" });
  }
});

// Get officials
app.get("/api/officials", async (req, res) => {
  try {
    let allMembers: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get("https://api.congress.gov/v3/member", {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { limit, offset, currentMember: true, format: "json" },
      });
      const members = response.data.members || [];
      allMembers = allMembers.concat(
        members.map((m: any) => ({
          ...m,
          chamber: m.terms?.item?.[m.terms.item.length - 1]?.chamber ?? null,
        })),
      );
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    res.json({ officials: allMembers, count: allMembers.length });
  } catch (error) {
    console.error("Error fetching officials:", error);
    res.status(500).json({ error: "Failed to fetch officials" });
  }
});

// Get single official
app.get("/api/officials/:bioguideId", async (req, res) => {
  try {
    const { bioguideId } = req.params;
    const response = await axios.get(
      `https://api.congress.gov/v3/member/${bioguideId}`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { format: "json" },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching official:", error);
    res.status(500).json({ error: "Failed to fetch official details" });
  }
});

// Get sponsored legislation - optimized to stop at 119th congress boundary
app.get("/api/officials/:bioguideId/sponsored", async (req, res) => {
  try {
    const { bioguideId } = req.params;
    let allLegislation: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;
    let allTimeCo = 0;

    // First get total count from pagination
    const firstPage = await axios.get(
      `https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { limit, offset, format: "json" },
      },
    );
    allTimeCo = firstPage.data.pagination?.count ?? 0;
    const firstPageItems = firstPage.data.sponsoredLegislation || [];

    // Check if this page has any 119th congress items
    const filtered119 = firstPageItems.filter((b: any) => b.congress === 119);
    allLegislation = allLegislation.concat(filtered119);

    // Stop early if we've already passed into older congresses
    const hasOlder = firstPageItems.some(
      (b: any) => b.congress !== undefined && b.congress < 119,
    );

    hasMore = !!firstPage.data.pagination?.next && !hasOlder;
    offset += limit;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { limit, offset, format: "json" },
        },
      );
      const page = response.data.sponsoredLegislation || [];
      const page119 = page.filter((b: any) => b.congress === 119);
      allLegislation = allLegislation.concat(page119);

      const hasOlderBills = page.some(
        (b: any) => b.congress !== undefined && b.congress < 119,
      );
      hasMore =
        !!response.data.pagination?.next &&
        page.length === limit &&
        !hasOlderBills;
      offset += limit;
    }

    res.json({
      legislation: allLegislation,
      count: allTimeCo,
    });
  } catch (error) {
    console.error("Error fetching sponsored legislation:", error);
    res.status(500).json({ error: "Failed to fetch sponsored legislation" });
  }
});

// Get cosponsored legislation - same optimization
app.get("/api/officials/:bioguideId/cosponsored", async (req, res) => {
  try {
    const { bioguideId } = req.params;
    let allLegislation: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;
    let allTimeCount = 0;

    const firstPage = await axios.get(
      `https://api.congress.gov/v3/member/${bioguideId}/cosponsored-legislation`,
      {
        headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
        params: { limit, offset, format: "json" },
      },
    );
    allTimeCount = firstPage.data.pagination?.count ?? 0;
    const firstPageItems = firstPage.data.cosponsoredLegislation || [];
    const filtered119 = firstPageItems.filter((b: any) => b.congress === 119);
    allLegislation = allLegislation.concat(filtered119);

    const hasOlder = firstPageItems.some(
      (b: any) => b.congress !== undefined && b.congress < 119,
    );
    hasMore = !!firstPage.data.pagination?.next && !hasOlder;
    offset += limit;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/member/${bioguideId}/cosponsored-legislation`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { limit, offset, format: "json" },
        },
      );
      const page = response.data.cosponsoredLegislation || [];
      const page119 = page.filter((b: any) => b.congress === 119);
      allLegislation = allLegislation.concat(page119);

      const hasOlderBills = page.some(
        (b: any) => b.congress !== undefined && b.congress < 119,
      );
      hasMore =
        !!response.data.pagination?.next &&
        page.length === limit &&
        !hasOlderBills;
      offset += limit;
    }

    res.json({
      legislation: allLegislation,
      count: allTimeCount,
    });
  } catch (error) {
    console.error("Error fetching cosponsored legislation:", error);
    res.status(500).json({ error: "Failed to fetch cosponsored legislation" });
  }
});

app.get("/api/officials/:bioguideId/policy-areas", async (req, res) => {
  try {
    const { bioguideId } = req.params;

    const fetchUntil119 = async (path: string, key: string): Promise<any[]> => {
      let all: any[] = [];
      let offset = 0;
      const limit = 250;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(
          `https://api.congress.gov/v3/member/${bioguideId}/${path}`,
          {
            headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
            params: { limit, offset, format: "json" },
          },
        );
        const page = response.data[key] || [];
        const page119 = page.filter((b: any) => b.congress === 119);
        all = all.concat(page119);

        const hasOlderBills = page.some(
          (b: any) => b.congress !== undefined && b.congress < 119,
        );
        hasMore =
          !!response.data.pagination?.next &&
          page.length === limit &&
          !hasOlderBills;
        offset += limit;
      }
      return all;
    };

    const [sponsored, cosponsored] = await Promise.all([
      fetchUntil119("sponsored-legislation", "sponsoredLegislation"),
      fetchUntil119("cosponsored-legislation", "cosponsoredLegislation"),
    ]);

    const counts: { [key: string]: number } = {};
    for (const bill of [...sponsored, ...cosponsored]) {
      const area = bill.policyArea?.name;
      if (area) counts[area] = (counts[area] || 0) + 1;
    }

    const policyAreas = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      policyAreas,
      totalSponsored: sponsored.length,
      totalCosponsored: cosponsored.length,
    });
  } catch (error) {
    console.error("Error fetching policy areas:", error);
    res.status(500).json({ error: "Failed to fetch policy areas" });
  }
});

app.get("/api/debug/update-dates", (req, res) => {
  const rows = db
    .prepare(
      `
    SELECT update_date, COUNT(*) as count 
    FROM bills 
    GROUP BY update_date 
    ORDER BY update_date DESC 
    LIMIT 10
  `,
    )
    .all();
  res.json(rows);
});

app.get("/api/cron/run", async (req, res) => {
  try {
    await runCronJob();
    res.json({ success: true });
  } catch (error) {
    console.error("Manual cron trigger error:", error);
    res.status(500).json({ error: "Cron job failed" });
  }
});

app.get("/api/push-tokens/list", (req, res) => {
  const rows = db.prepare("SELECT * FROM push_registrations").all();
  res.json(rows);
});

app.post("/api/push-tokens", (req, res) => {
  try {
    const {
      token,
      policyAreas,
      followedStates,
      followedBills,
      followedOfficials,
    } = req.body;

    if (!token) return res.status(400).json({ error: "Token required" });

    db.prepare(
      `
      INSERT INTO push_registrations (token, policy_areas, followed_states, followed_bills, followed_officials, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET
        policy_areas = excluded.policy_areas,
        followed_states = excluded.followed_states,
        followed_bills = excluded.followed_bills,
        followed_officials = excluded.followed_officials,
        updated_at = excluded.updated_at
    `,
    ).run(
      token,
      JSON.stringify(policyAreas ?? []),
      JSON.stringify(followedStates ?? []),
      JSON.stringify(followedBills ?? []),
      JSON.stringify(followedOfficials ?? []),
      Date.now(),
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving push token:", error);
    res.status(500).json({ error: "Failed to save push token" });
  }
});

const prewarmCache = async () => {
  try {
    await axios.get(`http://localhost:${PORT}/api/bills`);
  } catch (error) {
    console.error("Cache pre-warm failed:", error);
  }
};

app.get("/api/debug/sample-bills", (req, res) => {
  const rows = db
    .prepare(
      `
    SELECT bill_id, update_date, latest_action_date, policy_area, sponsor_state 
    FROM bills 
    WHERE policy_area IS NOT NULL
    AND latest_action_date IS NOT NULL
    ORDER BY latest_action_date DESC
    LIMIT 20
  `,
    )
    .all();
  res.json(rows);
});

app.get("/api/debug/meta", (req, res) => {
  const rows = db.prepare(`SELECT * FROM meta`).all();
  res.json(rows);
});

app.get("/api/debug/old-bills-with-policy", (req, res) => {
  const rows = db
    .prepare(
      `
    SELECT bill_id, update_date, policy_area
    FROM bills
    WHERE update_date >= date('now', '-3 days')
      AND type IN ('HR', 'S')
      AND policy_area IS NOT NULL
    ORDER BY update_date DESC
    LIMIT 50
  `,
    )
    .all();
  res.json(rows);
});

// Get official biography from Bioguide
app.get("/api/officials/:bioguideId/bio", async (req, res) => {
  try {
    const { bioguideId } = req.params;
    const response = await axios.get(
      `https://bioguide.congress.gov/search/bio/${bioguideId}.json`,
      { timeout: 8000 },
    );
    const data = response.data?.data;
    if (!data) return res.status(404).json({ error: "Bio not found" });
    res.json({
      profileText: data.profileText ?? null,
      birthDate: data.birthDate ?? null,
      nickName: data.nickName ?? null,
      creativeWork: data.creativeWork ?? [],
    });
  } catch (error) {
    console.error("Error fetching bio:", error);
    res.status(500).json({ error: "Failed to fetch biography" });
  }
});

const fs = require("fs");
const path = require("path");

app.post("/report-error", reportLimiter, express.json(), (req, res) => {
  const { message, screen } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] Screen: ${screen || "unknown"}\n${message.trim()}\n${"─".repeat(60)}\n`;
  const logPath = path.join("/data", "error-reports.txt");

  fs.appendFileSync(logPath, entry, "utf8");
  res.json({ success: true });
});

app.get("/api/debug/error-reports", (req, res) => {
  const logPath = path.join("/data", "error-reports.txt");
  if (!fs.existsSync(logPath)) {
    return res.json({ reports: "No reports yet." });
  }
  const content = fs.readFileSync(logPath, "utf8");
  res.send(`<pre>${content}</pre>`);
});

app.listen(PORT, () => {
  startCronScheduler();
});
