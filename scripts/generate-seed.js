// scripts/generate-seed.js
//
// Run this from the scripts/ folder before each app release:
//   node generate-seed.js
//
// Fetches all bills AND officials from Railway, writes them into assets/seed.db

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const RAILWAY_BILLS_URL = "https://unum-production.up.railway.app/api/bills";
const RAILWAY_OFFICIALS_URL =
  "https://unum-production.up.railway.app/api/officials";
const OUTPUT_PATH = path.join(__dirname, "../assets/seed.db");

async function fetchAllBills() {
  console.log("📡 Fetching all bills from Railway...");
  const res = await fetch(RAILWAY_BILLS_URL);
  if (!res.ok) throw new Error(`Railway bills returned ${res.status}`);
  const data = await res.json();
  console.log(`✅ Fetched ${data.bills.length} bills`);
  return data.bills;
}

async function fetchAllOfficials() {
  console.log("📡 Fetching all officials from Railway...");
  const res = await fetch(RAILWAY_OFFICIALS_URL);
  if (!res.ok) throw new Error(`Railway officials returned ${res.status}`);
  const data = await res.json();
  console.log(`✅ Fetched ${data.officials.length} officials`);
  return data; // full response object { officials, count }
}

async function main() {
  const assetsDir = path.join(__dirname, "../assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH);
    console.log("🗑  Removed old seed.db");
  }

  const db = new Database(OUTPUT_PATH);

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

    CREATE TABLE IF NOT EXISTS officials_list_cache (
      id         INTEGER PRIMARY KEY CHECK (id = 1),
      data       TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // ── Bills ──────────────────────────────────────────────────────────────────
  const bills = await fetchAllBills();

  const insertBill = db.prepare(`
    INSERT INTO bills (
      bill_id, type, number, congress, title, origin_chamber,
      latest_action_date, latest_action_text, update_date,
      policy_area, sponsor_state, congress_order, data, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(bill_id) DO NOTHING
  `);

  const insertAllBills = db.transaction((bills) => {
    bills.forEach((bill, index) => {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;
      insertBill.run(
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
        index,
        JSON.stringify(bill),
        Date.now(),
      );
    });
  });

  console.log("💾 Writing bills to seed.db...");
  insertAllBills(bills);

  // ── Officials ──────────────────────────────────────────────────────────────
  const officialsResponse = await fetchAllOfficials();

  console.log("💾 Writing officials to seed.db...");
  db.prepare(
    `
    INSERT INTO officials_list_cache (id, data, fetched_at) VALUES (1, ?, ?)
  `,
  ).run(JSON.stringify(officialsResponse), Date.now());

  // ── Seed date ──────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  db.prepare(`INSERT INTO meta (key, value) VALUES ('seed_date', ?)`).run(
    today,
  );

  db.close();

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ seed.db written to assets/seed.db (${sizeMB} MB)`);
  console.log(`📅 Seed date: ${today}`);
  console.log(`\nNext: commit assets/seed.db and run your EAS build.`);
}

main().catch((err) => {
  console.error("❌ Seed generation failed:", err);
  process.exit(1);
});
