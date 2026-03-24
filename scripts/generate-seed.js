// scripts/generate-seed.js
//
// Run this from the scripts/ folder before each app release:
//   node generate-seed.js
//
// What it does:
//   1. Hits your Railway /api/bills endpoint and downloads all bills
//   2. Writes them into assets/seed.db (relative to project root)
//   3. That file gets bundled into the app via expo-asset
//
// Requirements (run once in scripts/ folder):
//   npm install better-sqlite3

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const RAILWAY_URL = "https://unum-production.up.railway.app/api/bills";

// Output goes to assets/ at the project root (one level up from scripts/)
const OUTPUT_PATH = path.join(__dirname, "../assets/seed.db");

async function fetchAllBills() {
  console.log("📡 Fetching all bills from Railway...");
  const res = await fetch(RAILWAY_URL);
  if (!res.ok) throw new Error(`Railway returned ${res.status}`);
  const data = await res.json();
  console.log(`✅ Fetched ${data.bills.length} bills`);
  return data.bills;
}

async function main() {
  // Ensure assets/ folder exists at project root
  const assetsDir = path.join(__dirname, "../assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Remove stale seed if it exists
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH);
    console.log("🗑  Removed old seed.db");
  }

  const db = new Database(OUTPUT_PATH);

  // Mirror the exact schema from app/utils/database.ts bills + meta tables
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS bills (
      bill_id             TEXT PRIMARY KEY,
      type                TEXT NOT NULL,
      number              TEXT NOT NULL,
      congress            INTEGER NOT NULL,
      title               TEXT NOT NULL,
      origin_chamber      TEXT,
      latest_action_date  TEXT,
      latest_action_text  TEXT,
      update_date         TEXT,
      policy_area         TEXT,
      sponsor_state       TEXT,
      congress_order      INTEGER,
      data                TEXT NOT NULL,
      synced_at           INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bills_update_date   ON bills(update_date DESC);
    CREATE INDEX IF NOT EXISTS idx_bills_policy_area   ON bills(policy_area);
    CREATE INDEX IF NOT EXISTS idx_bills_sponsor_state ON bills(sponsor_state);

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const bills = await fetchAllBills();

  const insert = db.prepare(`
    INSERT INTO bills (
      bill_id, type, number, congress, title, origin_chamber,
      latest_action_date, latest_action_text, update_date,
      policy_area, sponsor_state, congress_order, data, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(bill_id) DO NOTHING
  `);

  const insertAll = db.transaction((bills) => {
    bills.forEach((bill, index) => {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;
      insert.run(
        billId,
        bill.type,
        bill.number,
        bill.congress,
        bill.title,
        bill.originChamber ?? null,
        bill.latestAction?.actionDate ?? null,
        bill.latestAction?.text ?? null,
        bill.updateDate ?? null,
        bill.policyArea?.name ?? null,
        bill.sponsors?.[0]?.state ?? null,
        index, // preserve Railway order as congress_order
        JSON.stringify(bill),
        Date.now(),
      );
    });
  });

  console.log("💾 Writing bills to seed.db...");
  insertAll(bills);

  // Store the seed generation date so the app knows where to delta-sync from
  const today = new Date().toISOString().split("T")[0];
  db.prepare(`INSERT INTO meta (key, value) VALUES ('seed_date', ?)`).run(
    today,
  );

  db.close();

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`✅ seed.db written to assets/seed.db (${sizeMB} MB)`);
  console.log(`📅 Seed date: ${today}`);
  console.log(`\nNext: commit assets/seed.db and run your EAS build.`);
}

main().catch((err) => {
  console.error("❌ Seed generation failed:", err);
  process.exit(1);
});
