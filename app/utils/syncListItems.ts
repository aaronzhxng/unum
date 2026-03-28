// app/utils/syncListItems.ts
//
// Syncs bill cards on the home screen with the latest data from the bills table.
// Runs on every app launch, fire-and-forget — never blocks startup.

import { getDb } from "./database";
import { storage } from "./storage";

export const syncListItemsFromBills = (): void => {
  try {
    const db = getDb();
    const lists = storage.getLists();
    if (!lists.length) return;

    let anyChanged = false;

    const updatedLists = lists.map((list) => ({
      ...list,
      items: list.items.map((item) => {
        if (item.type !== "bill") return item;

        // Look up fresh data from the bills SQLite table
        const row = db.getFirstSync<{
          latest_action_date: string | null;
          latest_action_text: string | null;
          update_date: string | null;
        }>(
          `SELECT latest_action_date, latest_action_text, update_date
           FROM bills WHERE bill_id = ?`,
          [item.id],
        );

        if (!row) return item;

        const newDate = row.latest_action_date ?? row.update_date ?? item.date;
        const newAction = row.latest_action_text ?? item.latestAction;

        // Only update if something actually changed
        if (newDate === item.date && newAction === item.latestAction) {
          return item;
        }

        anyChanged = true;
        return {
          ...item,
          date: newDate ?? item.date,
          latestAction: newAction ?? item.latestAction,
        };
      }),
    }));

    if (anyChanged) {
      storage.saveLists(updatedLists);
    }
  } catch (error) {
    console.error("syncListItemsFromBills failed:", error);
  }
};
