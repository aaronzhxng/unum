import AsyncStorage from "@react-native-async-storage/async-storage";
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

// ─── Schema setup ─────────────────────────────────────────────────────────────

export const initializeDatabase = async (): Promise<void> => {
  const database = getDb();

  // Create all tables if they don't exist yet
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

    CREATE TABLE IF NOT EXISTS officials_list_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  try {
    database.execSync(
      `ALTER TABLE list_items ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {}

  // Run migration from AsyncStorage on first launch
  await migrateFromAsyncStorage(database);
};

// ─── Migration from AsyncStorage ─────────────────────────────────────────────
// Runs once on first launch after this update. Reads existing data from
// AsyncStorage and writes it into SQLite, then clears AsyncStorage.

const MIGRATION_KEY = "sqlite_migration_v1_complete";

const migrateFromAsyncStorage = async (
  database: SQLite.SQLiteDatabase,
): Promise<void> => {
  try {
    // Check if migration already ran
    const existing = database.getFirstSync<{ value: string }>(
      "SELECT value FROM meta WHERE key = ?",
      [MIGRATION_KEY],
    );
    if (existing) return;

    console.log("🔄 Migrating data from AsyncStorage to SQLite...");

    // ── Migrate lists and list items ────────────────────────────────────────
    const listsRaw = await AsyncStorage.getItem("user_lists");
    if (listsRaw) {
      const lists: UserList[] = JSON.parse(listsRaw);

      for (const list of lists) {
        // Insert list (ignore if somehow already exists)
        database.runSync(
          `INSERT OR IGNORE INTO lists (id, name) VALUES (?, ?)`,
          [list.id, list.name],
        );

        // Insert each item in the list
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

      console.log(`✅ Migrated ${lists.length} lists`);
    }

    // ── Migrate bill cache ───────────────────────────────────────────────────
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
    if (billKeys.length > 0)
      console.log(`✅ Migrated ${billKeys.length} cached bills`);

    // ── Migrate official bills cache ─────────────────────────────────────────
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
    if (officialKeys.length > 0)
      console.log(`✅ Migrated ${officialKeys.length} official bill caches`);

    // ── Clean up AsyncStorage ────────────────────────────────────────────────
    const keysToRemove = [
      "user_lists",
      "current_list_id",
      ...billKeys,
      ...officialKeys,
    ];
    await AsyncStorage.multiRemove(keysToRemove);
    console.log("🧹 Cleared AsyncStorage after migration");

    // ── Mark migration complete ──────────────────────────────────────────────
    database.runSync(`INSERT INTO meta (key, value) VALUES (?, ?)`, [
      MIGRATION_KEY,
      "true",
    ]);

    console.log("✅ Migration complete");
  } catch (error) {
    console.error("Migration error:", error);
    // Don't crash the app — if migration fails, the app still works,
    // it just starts fresh in SQLite.
  }
};
