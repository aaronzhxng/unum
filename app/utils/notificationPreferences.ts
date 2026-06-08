import { getDb } from "./database";

export const notificationPreferences = {
  // Check if notifications are enabled for a specific item
  isEnabled: (id: string): boolean => {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ enabled: number }>(
        "SELECT enabled FROM notification_preferences WHERE id = ?",
        [id],
      );
      return row?.enabled === 1;
    } catch {
      return false;
    }
  },

  // Toggle notifications for an item — returns the new state
  toggle: (id: string, type: "bill" | "official" | "list"): boolean => {
    try {
      const db = getDb();
      const existing = db.getFirstSync<{ enabled: number }>(
        "SELECT enabled FROM notification_preferences WHERE id = ?",
        [id],
      );

      if (existing) {
        const newValue = existing.enabled === 1 ? 0 : 1;
        db.runSync(
          "UPDATE notification_preferences SET enabled = ? WHERE id = ?",
          [newValue, id],
        );
        return newValue === 1;
      } else {
        // First time enabling — insert as enabled
        db.runSync(
          "INSERT INTO notification_preferences (id, type, enabled) VALUES (?, ?, 1)",
          [id, type],
        );
        return true;
      }
    } catch {
      return false;
    }
  },

  // Enable notifications for an item
  enable: (id: string, type: "bill" | "official" | "list"): void => {
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO notification_preferences (id, type, enabled) VALUES (?, ?, 1)
         ON CONFLICT(id) DO UPDATE SET enabled = 1`,
        [id, type],
      );
    } catch {}
  },

  // Disable notifications for an item
  disable: (id: string): void => {
    try {
      const db = getDb();
      db.runSync(
        "UPDATE notification_preferences SET enabled = 0 WHERE id = ?",
        [id],
      );
    } catch {}
  },

  // Get all enabled notification IDs of a given type
  getAllEnabled: (type: "bill" | "official" | "list"): string[] => {
    try {
      const db = getDb();
      const rows = db.getAllSync<{ id: string }>(
        "SELECT id FROM notification_preferences WHERE type = ? AND enabled = 1",
        [type],
      );
      return rows.map((r) => r.id);
    } catch {
      return [];
    }
  },
  // Save which notification sub-types are enabled for an item
  saveSubTypes: (
    id: string,
    type: "bill" | "official" | "list",
    subTypes: string[],
    name?: string,
  ): void => {
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO notification_preferences (id, type, enabled, sub_types, name) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled, sub_types = excluded.sub_types,
           name = COALESCE(excluded.name, notification_preferences.name)`,
        [id, type, subTypes.length > 0 ? 1 : 0, JSON.stringify(subTypes), name ?? null],
      );
    } catch {}
  },

  // Get which sub-types are enabled for an item
  getSubTypes: (id: string): string[] => {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ sub_types: string; enabled: number }>(
        "SELECT sub_types, enabled FROM notification_preferences WHERE id = ?",
        [id],
      );
      if (!row?.sub_types || row.enabled === 0) return [];
      return JSON.parse(row.sub_types);
    } catch {
      return [];
    }
  },
};
