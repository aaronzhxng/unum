import { getDb } from "./database";
import { notificationPreferences } from "./notificationPreferences";
import { pushToken } from "./pushToken";

const BACKEND_URL = "https://unum-production.up.railway.app";

export const syncPreferencesToBackend = async (): Promise<void> => {
  try {
    const token = pushToken.get();

    if (!token) return; // No token means notifications aren't enabled

    // Get followed policy areas
    const policyAreas = notificationPreferences.getSubTypes("policy_areas");

    // Get all enabled states (stored as "state_NY", "state_CA", etc.)
    const allEnabledOfficialIds =
      notificationPreferences.getAllEnabled("official");
    const followedStates = allEnabledOfficialIds
      .filter((id) => id.startsWith("state_"))
      .map((id) => id.replace("state_", ""));

    // Get all enabled bills with their sub-types
    const allEnabledBillIds = notificationPreferences.getAllEnabled("bill");
    const followedBills = allEnabledBillIds
      .filter((id) => id.startsWith("bill_"))
      .map((id) => ({
        billId: id.replace(/^bill_/, ""),
        subTypes: notificationPreferences.getSubTypes(id),
      }));

    // Get all enabled officials with their sub-types
    const allEnabledOfficials = allEnabledOfficialIds.filter(
      (id) => !id.startsWith("state_"),
    );

    const db = getDb();

    const SUGGESTED_OFFICIAL_NAMES: Record<string, string> = {
      O000172: "Alexandria Ocasio-Cortez",
      S000033: "Bernie Sanders",
      M000355: "Mitch McConnell",
      J000299: "Mike Johnson",
      J000294: "Hakeem Jeffries",
      C001098: "Ted Cruz",
      P000603: "Rand Paul",
    };

    const getNameFromOfficialsCache = (bioguideId: string): string | null => {
      try {
        const cacheRow = db.getFirstSync<{ data: string }>(
          `SELECT data FROM officials_list_cache WHERE id = 1`,
        );
        if (!cacheRow) return null;
        const parsed = JSON.parse(cacheRow.data);
        const found = (parsed?.officials ?? []).find(
          (o: any) => o.bioguideId === bioguideId,
        );
        if (!found?.name) return null;
        const n: string = found.name;
        return n.includes(",")
          ? n.split(",").reverse().map((s: string) => s.trim()).join(" ")
          : n;
      } catch {
        return null;
      }
    };

    const followedOfficials = allEnabledOfficials.map((id) => {
      const bioguideId = id.replace(/^official_/, "");
      const row = db.getFirstSync<{ name: string }>(
        `SELECT name FROM list_items WHERE item_id = ? AND item_type = 'official' LIMIT 1`,
        [bioguideId],
      );
      const rawName = row?.name ?? null;
      const formattedName = rawName?.includes(",")
        ? rawName
            .split(",")
            .reverse()
            .map((s: string) => s.trim())
            .join(" ")
        : (rawName ?? null);

      // Only hit notification_preferences if list_items didn't have a name
      const storedNotifName = formattedName === null
        ? (db.getFirstSync<{ name: string }>(
            `SELECT name FROM notification_preferences WHERE id = ? AND name IS NOT NULL LIMIT 1`,
            [id],
          )?.name ?? null)
        : null;

      const name =
        formattedName ??
        storedNotifName ??
        SUGGESTED_OFFICIAL_NAMES[bioguideId] ??
        getNameFromOfficialsCache(bioguideId) ??
        bioguideId;

      return {
        bioguideId,
        name,
        subTypes: notificationPreferences.getSubTypes(id),
      };
    });

    console.log(
      "Syncing to backend:",
      JSON.stringify({
        token,
        policyAreas,
        followedStates,
        followedBills,
        followedOfficials,
      }),
    );

    await fetch(`${BACKEND_URL}/api/push-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        policyAreas,
        followedStates,
        followedBills,
        followedOfficials,
      }),
    });
  } catch (error) {
    console.error("Failed to sync preferences to backend:", error);
  }
};
