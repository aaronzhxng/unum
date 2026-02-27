import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test endpoint - get bills from Congress.gov
app.get("/api/bills", async (req, res) => {
  try {
    const response = await axios.get("https://api.congress.gov/v3/bill/119", {
      headers: {
        "X-Api-Key": process.env.CONGRESS_API_KEY,
      },
      params: {
        limit: 250, // Change from 20 to 250 (max allowed)
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

// Get officials from Congress.gov
app.get("/api/officials", async (req, res) => {
  try {
    const response = await axios.get("https://api.congress.gov/v3/member", {
      headers: {
        "X-Api-Key": process.env.CONGRESS_API_KEY,
      },
      params: {
        limit: 100,
        currentMember: true,
      },
    });

    res.json({
      officials: response.data.members,
      count: response.data.members.length,
    });
  } catch (error) {
    console.error("Error fetching officials:", error);
    res.status(500).json({ error: "Failed to fetch officials" });
  }
});

// Get single bill by ID
app.get("/api/bills/:billId", async (req, res) => {
  try {
    const { billId } = req.params;

    // billId format: "hr187" or "s2296"
    // Extract type and number
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid bill ID format" });
    }

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    const response = await axios.get(
      `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}`,
      {
        headers: {
          "X-Api-Key": process.env.CONGRESS_API_KEY,
        },
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

    // billId format: "hr187" or "s2296"
    // Extract type and number
    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid bill ID format" });
    }

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    const response = await axios.get(
      `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/summaries`,
      {
        headers: {
          "X-Api-Key": process.env.CONGRESS_API_KEY,
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Failed to fetch bill summaries" });
  }
});

// Get single official by bioguide ID
app.get("/api/officials/:bioguideId", async (req, res) => {
  try {
    const { bioguideId } = req.params;

    const response = await axios.get(
      `https://api.congress.gov/v3/member/${bioguideId}`,
      {
        headers: {
          "X-Api-Key": process.env.CONGRESS_API_KEY,
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching official:", error);
    res.status(500).json({ error: "Failed to fetch official details" });
  }
});

// Get bill actions
app.get("/api/bills/:billId/actions", async (req, res) => {
  try {
    const { billId } = req.params;

    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid bill ID format" });
    }

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    // Fetch all pages of actions
    let allActions: any[] = [];
    let offset = 0;
    const limit = 250; // Max allowed by API
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/actions`,
        {
          headers: {
            "X-Api-Key": process.env.CONGRESS_API_KEY,
          },
          params: {
            offset,
            limit,
          },
        },
      );

      const actions = response.data.actions || [];
      allActions = allActions.concat(actions);

      // Check if there are more pages
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    res.json({
      actions: allActions,
      pagination: { count: allActions.length },
    });
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ error: "Failed to fetch bill actions" });
  }
});

// Get bill amendments
app.get("/api/bills/:billId/amendments", async (req, res) => {
  try {
    const { billId } = req.params;

    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid bill ID format" });
    }

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    // Fetch all pages of amendments
    let allAmendments: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/amendments`,
        {
          headers: {
            "X-Api-Key": process.env.CONGRESS_API_KEY,
          },
          params: {
            offset,
            limit,
          },
        },
      );

      const amendments = response.data.amendments || [];
      allAmendments = allAmendments.concat(amendments);

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

    const response = await axios.get(
      `https://api.congress.gov/v3/amendment/119/${amendmentType.toLowerCase()}/${amendmentNumber}`,
      {
        headers: {
          "X-Api-Key": process.env.CONGRESS_API_KEY,
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching amendment:", error);
    res.status(500).json({ error: "Failed to fetch amendment details" });
  }
});

// Get bill votes (parsed from recorded vote XML URLs in actions)
app.get("/api/bills/:billId/votes", async (req, res) => {
  try {
    const { billId } = req.params;

    const match = billId.match(/^([a-z]+)(\d+)$/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid bill ID format" });
    }

    const billType = match[1].toLowerCase();
    const billNumber = match[2];

    // Step 1: Fetch all actions to find recordedVotes URLs
    let allActions: any[] = [];
    let offset = 0;
    const limit = 250;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.congress.gov/v3/bill/119/${billType}/${billNumber}/actions`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { offset, limit },
        },
      );
      allActions = allActions.concat(response.data.actions || []);
      hasMore = response.data.pagination?.next != null;
      offset += limit;
    }

    // Step 2: Extract all recordedVote entries
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
      return res.json({ votes: [] });
    }

    // Deduplicate by rollNumber + chamber
    const seen = new Set<string>();
    const uniqueVotes = recordedVotes.filter((v) => {
      const key = `${v.chamber}-${v.rollNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Step 3: Parse XML
    const parseVoteXml = (xml: string, meta: any) => {
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
        const countBlocks = [...xml.matchAll(/<count>([\s\S]*?)<\/count>/gi)];
        for (const block of countBlocks) {
          const inner = block[1];
          const party =
            inner.match(/<party>(.*?)<\/party>/i)?.[1]?.trim() ?? "";
          const yea = parseInt(inner.match(/<yeas>(\d+)<\/yeas>/i)?.[1] ?? "0");
          const nay = parseInt(inner.match(/<nays>(\d+)<\/nays>/i)?.[1] ?? "0");
          const present = parseInt(
            inner.match(/<present>(\d+)<\/present>/i)?.[1] ?? "0",
          );
          const notVoting = parseInt(
            inner.match(/<absent>(\d+)<\/absent>/i)?.[1] ?? "0",
          );

          if (party === "D") dem = { yea, nay, present, notVoting };
          else if (party === "R") rep = { yea, nay, present, notVoting };
          else if (party === "I") ind = { yea, nay, present, notVoting };
        }
        result = get("vote_result");
        question = get("vote_question");
        title = get("vote_title") || title;
      } else {
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
      };
    };

    const voteResults = await Promise.allSettled(
      uniqueVotes.map(async (meta) => {
        const response = await axios.get(meta.url, {
          timeout: 8000,
          responseType: "text",
        });
        if (meta.chamber?.toLowerCase() === "senate") {
          console.log("SENATE XML:", response.data.substring(0, 3000));
        }
        return parseVoteXml(response.data, meta);
      }),
    );

    const votes = voteResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    res.json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Failed to fetch vote data" });
  }
});
