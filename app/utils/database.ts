import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

// ─── Types (shared with storage.ts) ──────────────────────────────────────────

export interface ListItem {
  id: string;
  type: "official" | "bill";
  name: string;
  party?: string;
  role?: string;
  date?: string;
  latestAction?: string;
  policyArea?: string;
  update?: string;
  avatar?: any;
  photoUrl?: string;
}

export interface UserList {
  id: string;
  name: string;
  items: ListItem[];
}

// ─── Database singleton ───────────────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync("unum.db");
  }
  return db;
};

// ─── Seed copy (Strategy C) ───────────────────────────────────────────────────
// On first install, if the bills table is empty, copy the pre-built seed.db
// from the app bundle into SQLite so the user sees data instantly with no
// network request. After copying, delta sync runs in the background to catch
// anything newer than the seed date.

export const copySeedIfNeeded = async (): Promise<boolean> => {
  try {
    const database = getDb();

    // Check if bills table already has data — if so, skip entirely
    const count = database.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM bills`,
    );
    if (count && count.count > 0) return false;

    console.log("🌱 Bills table empty — copying seed.db...");

    // Load the seed asset from the bundle
    const asset = Asset.fromModule(require("../../assets/seed.db"));
    await asset.downloadAsync();

    if (!asset.localUri) {
      console.warn("⚠️ seed.db asset has no localUri — skipping seed copy");
      return false;
    }

    const docDir = FileSystem.documentDirectory;
    if (!docDir) {
      console.warn("⚠️ documentDirectory unavailable — skipping seed copy");
      return false;
    }

    const destPath = `${docDir}SQLite/seed_import.db`;

    // Ensure the SQLite directory exists
    await FileSystem.makeDirectoryAsync(`${docDir}SQLite`, {
      intermediates: true,
    });

    // Copy seed file to a readable location
    await FileSystem.copyAsync({ from: asset.localUri, to: destPath });

    // Open the seed database and read all bills from it
    const seedDb = SQLite.openDatabaseSync("seed_import.db");

    const bills = seedDb.getAllSync<{
      bill_id: string;
      type: string;
      number: string;
      congress: number;
      title: string;
      origin_chamber: string | null;
      latest_action_date: string | null;
      latest_action_text: string | null;
      update_date: string | null;
      policy_area: string | null;
      sponsor_state: string | null;
      congress_order: number | null;
      data: string;
      synced_at: number;
    }>(`SELECT * FROM bills`);

    // Read the seed date from meta
    const seedMeta = seedDb.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'seed_date'`,
    );
    const seedDate = seedMeta?.value ?? null;

    seedDb.closeSync();

    if (bills.length === 0) {
      console.warn("⚠️ seed.db contained no bills — skipping");
      return false;
    }

    // Insert all bills into the live database in one transaction
    const stmt = database.prepareSync(
      `INSERT INTO bills (
        bill_id, type, number, congress, title, origin_chamber,
        latest_action_date, latest_action_text, update_date,
        policy_area, sponsor_state, congress_order, data, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(bill_id) DO NOTHING`,
    );

    database.withTransactionSync(() => {
      for (const bill of bills) {
        stmt.executeSync([
          bill.bill_id,
          bill.type,
          bill.number,
          bill.congress,
          bill.title,
          bill.origin_chamber,
          bill.latest_action_date,
          bill.latest_action_text,
          bill.update_date,
          bill.policy_area,
          bill.sponsor_state,
          bill.congress_order,
          bill.data,
          bill.synced_at,
        ]);
      }
    });

    stmt.finalizeSync();

    // Store the seed date in meta so delta sync knows where to start from
    if (seedDate) {
      database.runSync(
        `INSERT INTO meta (key, value) VALUES ('last_bills_sync', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [seedDate],
      );
    }

    // Clean up the temporary seed file
    await FileSystem.deleteAsync(destPath, { idempotent: true });

    console.log(`✅ Seed copy complete: ${bills.length} bills loaded`);
    return true;
  } catch (error) {
    console.error("❌ Seed copy failed:", error);
    return false; // Non-fatal — app will fall back to Railway fetch
  }
};

// ─── Schema setup ─────────────────────────────────────────────────────────────

export const initializeDatabase = async (): Promise<void> => {
  const database = getDb();

  database.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS list_items (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      name TEXT NOT NULL,
      party TEXT,
      role TEXT,
      date TEXT,
      latest_action TEXT,
      policy_area TEXT,
      update_text TEXT,
      photo_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bill_cache (
      bill_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS official_bills_cache (
      cache_key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills_list_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
      bill_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      number TEXT NOT NULL,
      congress INTEGER NOT NULL,
      title TEXT NOT NULL,
      origin_chamber TEXT,
      latest_action_date TEXT,
      latest_action_text TEXT,
      update_date TEXT,
      policy_area TEXT,
      sponsor_state TEXT,
      congress_order INTEGER,
      data TEXT NOT NULL,
      synced_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bills_update_date ON bills(update_date DESC);
    CREATE INDEX IF NOT EXISTS idx_bills_policy_area ON bills(policy_area);
    CREATE INDEX IF NOT EXISTS idx_bills_sponsor_state ON bills(sponsor_state);

    CREATE TABLE IF NOT EXISTS officials_list_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS push_token (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      token TEXT NOT NULL,
      registered_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  try {
    database.execSync(
      `ALTER TABLE list_items ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {}
  try {
    database.execSync(
      `ALTER TABLE notification_preferences ADD COLUMN sub_types TEXT`,
    );
  } catch {}
  try {
    database.execSync(`ALTER TABLE bills ADD COLUMN congress_order INTEGER`);
  } catch {}

  // Copy seed.db into bills table if this is a fresh install
  await copySeedIfNeeded();

  // Run migration from AsyncStorage on first launch
  await migrateFromAsyncStorage(database);
};

// ─── Migration from AsyncStorage ─────────────────────────────────────────────

const MIGRATION_KEY = "sqlite_migration_v1_complete";

const migrateFromAsyncStorage = async (
  database: SQLite.SQLiteDatabase,
): Promise<void> => {
  try {
    const existing = database.getFirstSync<{ value: string }>(
      "SELECT value FROM meta WHERE key = ?",
      [MIGRATION_KEY],
    );
    if (existing) return;

    const listsRaw = await AsyncStorage.getItem("user_lists");
    if (listsRaw) {
      const lists: UserList[] = JSON.parse(listsRaw);

      for (const list of lists) {
        database.runSync(
          `INSERT OR IGNORE INTO lists (id, name) VALUES (?, ?)`,
          [list.id, list.name],
        );

        for (const item of list.items || []) {
          const rowId = `${list.id}__${item.id}`;
          database.runSync(
            `INSERT OR IGNORE INTO list_items
              (id, list_id, item_id, item_type, name, party, role, date,
               latest_action, policy_area, update_text, photo_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              rowId,
              list.id,
              item.id,
              item.type,
              item.name,
              item.party ?? null,
              item.role ?? null,
              item.date ?? null,
              item.latestAction ?? null,
              item.policyArea ?? null,
              item.update ?? null,
              item.photoUrl ?? null,
            ],
          );
        }
      }
    }

    const allKeys = await AsyncStorage.getAllKeys();

    const billKeys = allKeys.filter((k) => k.startsWith("bill_cache_"));
    for (const key of billKeys) {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const billId = key.replace("bill_cache_", "");
      database.runSync(
        `INSERT OR IGNORE INTO bill_cache (bill_id, data, fetched_at) VALUES (?, ?, ?)`,
        [billId, JSON.stringify(parsed.data), parsed.timestamp],
      );
    }

    const officialKeys = allKeys.filter((k) =>
      k.startsWith("official_bills_cache_"),
    );
    for (const key of officialKeys) {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const cacheKey = key.replace("official_bills_cache_", "");
      database.runSync(
        `INSERT OR IGNORE INTO official_bills_cache (cache_key, data, fetched_at) VALUES (?, ?, ?)`,
        [cacheKey, JSON.stringify(parsed.data), parsed.timestamp],
      );
    }

    const keysToRemove = [
      "user_lists",
      "current_list_id",
      ...billKeys,
      ...officialKeys,
    ];
    await AsyncStorage.multiRemove(keysToRemove);

    database.runSync(`INSERT INTO meta (key, value) VALUES (?, ?)`, [
      MIGRATION_KEY,
      "true",
    ]);
  } catch (error) {
    console.error("Migration error:", error);
  }
};
