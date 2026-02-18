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
