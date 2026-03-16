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

    const followedOfficials = allEnabledOfficials.map((id) => {
      const bioguideId = id.replace(/^official_/, "");
      const row = db.getFirstSync<{ name: string }>(
        `SELECT name FROM list_items WHERE item_id = ? AND item_type = 'official' LIMIT 1`,
        [bioguideId],
      );
      return {
        bioguideId,
        name: row?.name ?? bioguideId,
        subTypes: notificationPreferences.getSubTypes(id),
      };
    });

    // console.log(
    //   "Syncing to backend:",
    //   JSON.stringify({
    //     token,
    //     policyAreas,
    //     followedStates,
    //     followedBills,
    //     followedOfficials,
    //   }),
    // );

    // await fetch(`${BACKEND_URL}/api/debug/token`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     token: "SYNC_DEBUG",
    //     error: JSON.stringify({
    //       policyAreas,
    //       followedStates,
    //       followedBills,
    //       followedOfficials,
    //     }),
    //   }),
    // }).catch(() => {});

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
