import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? "/data";
const DB_PATH = path.join(DB_DIR, "unum.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS push_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    policy_areas TEXT NOT NULL DEFAULT '[]',
    followed_states TEXT NOT NULL DEFAULT '[]',
    followed_bills TEXT NOT NULL DEFAULT '[]',
    followed_officials TEXT NOT NULL DEFAULT '[]',
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bills (
    bill_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    policy_area TEXT,
    sponsor_state TEXT,
    update_date TEXT,
    synced_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_bills_update_date ON bills(update_date DESC);
  CREATE INDEX IF NOT EXISTS idx_bills_policy_area ON bills(policy_area);
  CREATE INDEX IF NOT EXISTS idx_bills_sponsor_state ON bills(sponsor_state);
`);

// Migration: add latest_action_date column if it doesn't exist
try {
  db.exec(`ALTER TABLE bills ADD COLUMN latest_action_date TEXT`);
} catch {
  // Column already exists, ignore
}

// Migration: add index after column exists
try {
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_bills_latest_action_date ON bills(latest_action_date DESC)`,
  );
} catch {}

// Migration: add notified_bills table if it doesn't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notified_bills (
      token TEXT NOT NULL,
      bill_id TEXT NOT NULL,
      notified_date TEXT NOT NULL,
      PRIMARY KEY (token, bill_id, notified_date)
    )
  `);
} catch {}

// Migration: add congress_cache table for persistent API response caching
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS congress_cache (
      cache_key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    )
  `);
} catch {}

// Migration: add index on cached_at for TTL cleanup
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_congress_cache_cached_at ON congress_cache(cached_at)
  `);
} catch {}

export default db;
