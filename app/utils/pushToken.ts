import Constants from "expo-constants";
import { Platform } from "react-native";
import { getDb } from "./database";

const isExpoGo = Constants.appOwnership === "expo";

export const pushToken = {
  register: async (): Promise<string | null> => {
    if (isExpoGo) {
      console.log("Push notifications not supported in Expo Go — skipping");
      return null;
    }

    try {
      const Notifications = await import("expo-notifications");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission denied");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      const db = getDb();
      db.runSync(
        `INSERT INTO push_token (id, token, registered_at) VALUES (1, ?, ?)
         ON CONFLICT(id) DO UPDATE SET token = excluded.token, registered_at = excluded.registered_at`,
        [token, Date.now()],
      );

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  },

  get: (): string | null => {
    if (isExpoGo) return null;
    try {
      const db = getDb();
      const row = db.getFirstSync<{ token: string }>(
        "SELECT token FROM push_token WHERE id = 1",
      );
      return row?.token ?? null;
    } catch {
      return null;
    }
  },
};
