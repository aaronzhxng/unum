// Replaces the AsyncStorage-backed storage.ts
// API surface is IDENTICAL — no screen changes needed.

import { getDb, ListItem, UserList } from "./database";

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type { ListItem, UserList };

export const storage = {
  // ── Get all lists (with their items) ────────────────────────────────────────
  getLists: (): UserList[] => {
    try {
      const db = getDb();
      const lists = db.getAllSync<{ id: string; name: string }>(
        `SELECT id, name FROM lists ORDER BY created_at ASC`,
      );

      return lists.map((list) => {
        const items = db.getAllSync<any>(
          `SELECT * FROM list_items WHERE list_id = ? ORDER BY order_index ASC, added_at ASC`,
          [list.id],
        );

        return {
          id: list.id,
          name: list.name,
          items: items.map(rowToListItem),
        };
      });
    } catch (error) {
      console.error("Error loading lists:", error);
      return [];
    }
  },

  // ── Save all lists ───────────────────────────────────────────────────────────
  // Replaces the entire lists state — used when bulk-updating from screens.
  saveLists: (lists: UserList[]): void => {
    try {
      const db = getDb();

      // Get current list IDs so we can delete removed ones
      const existing = db.getAllSync<{ id: string }>(`SELECT id FROM lists`);
      const existingIds = new Set(existing.map((r) => r.id));
      const newIds = new Set(lists.map((l) => l.id));

      // Delete lists that were removed
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          db.runSync(`DELETE FROM lists WHERE id = ?`, [id]);
          // list_items cascade-deletes via FK
        }
      }

      // Upsert each list and its items
      for (const list of lists) {
        db.runSync(
          `INSERT INTO lists (id, name) VALUES (?, ?)
           ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
          [list.id, list.name],
        );

        // Remove items no longer in this list
        const newItemIds = new Set(
          (list.items || []).map((item) => `${list.id}__${item.id}`),
        );
        const existingItems = db.getAllSync<{ id: string }>(
          `SELECT id FROM list_items WHERE list_id = ?`,
          [list.id],
        );
        for (const row of existingItems) {
          if (!newItemIds.has(row.id)) {
            db.runSync(`DELETE FROM list_items WHERE id = ?`, [row.id]);
          }
        }

        // Upsert each item
        (list.items || []).forEach((item, index) => {
          upsertListItem(db, list.id, item, index);
        });
      }
    } catch (error) {
      console.error("Error saving lists:", error);
    }
  },

  // ── Current list ID (stored in the meta table) ───────────────────────────────
  getCurrentListId: (): string | null => {
    try {
      const db = getDb();
      const row = db.getFirstSync<{ value: string }>(
        `SELECT value FROM meta WHERE key = 'current_list_id'`,
      );
      return row?.value ?? null;
    } catch (error) {
      console.error("Error loading current list:", error);
      return null;
    }
  },

  setCurrentListId: (id: string): void => {
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO meta (key, value) VALUES ('current_list_id', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [id],
      );
    } catch (error) {
      console.error("Error saving current list:", error);
    }
  },

  // ── Initialize default list on first launch ──────────────────────────────────
  initializeDefaultList: (): UserList => {
    try {
      const db = getDb();
      const lists = storage.getLists();

      if (lists.length === 0) {
        const defaultList: UserList = {
          id: "my-list",
          name: "My List",
          items: [],
        };
        db.runSync(`INSERT OR IGNORE INTO lists (id, name) VALUES (?, ?)`, [
          defaultList.id,
          defaultList.name,
        ]);
        storage.setCurrentListId(defaultList.id);
        return defaultList;
      }

      return lists[0];
    } catch (error) {
      console.error("Error initializing default list:", error);
      return { id: "my-list", name: "My List", items: [] };
    }
  },

  // ── Delete a list ────────────────────────────────────────────────────────────
  deleteList: (listId: string): void => {
    try {
      const db = getDb();
      const count = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM lists`,
      );

      if ((count?.count ?? 0) <= 1) {
        console.warn("Cannot delete the last list");
        return;
      }

      db.runSync(`DELETE FROM lists WHERE id = ?`, [listId]);

      // If deleted list was active, switch to first remaining
      const currentId = storage.getCurrentListId();
      if (currentId === listId) {
        const first = db.getFirstSync<{ id: string }>(
          `SELECT id FROM lists ORDER BY created_at ASC LIMIT 1`,
        );
        if (first) storage.setCurrentListId(first.id);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const upsertListItem = (
  db: any,
  listId: string,
  item: ListItem,
  orderIndex: number,
): void => {
  const rowId = `${listId}__${item.id}`;
  db.runSync(
    `INSERT INTO list_items
      (id, list_id, item_id, item_type, name, party, role, date,
       latest_action, policy_area, update_text, photo_url, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       party = excluded.party,
       role = excluded.role,
       date = excluded.date,
       latest_action = excluded.latest_action,
       policy_area = excluded.policy_area,
       update_text = excluded.update_text,
       photo_url = excluded.photo_url,
       order_index = excluded.order_index`,
    [
      rowId,
      listId,
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
      orderIndex,
    ],
  );
};

const rowToListItem = (row: any): ListItem => ({
  id: row.item_id,
  type: row.item_type as "official" | "bill",
  name: row.name,
  party: row.party ?? undefined,
  role: row.role ?? undefined,
  date: row.date ?? undefined,
  latestAction: row.latest_action ?? undefined,
  policyArea: row.policy_area ?? undefined,
  update: row.update_text ?? undefined,
  photoUrl: row.photo_url ?? undefined,
});
