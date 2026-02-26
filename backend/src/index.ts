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
        limit: 20,
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
