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
`);

export default db;
