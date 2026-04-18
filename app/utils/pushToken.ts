import Constants from "expo-constants";
import { Platform } from "react-native";
import { getDb } from "./database";

// const isStandalone = () => {
//   const env = Constants.executionEnvironment;
//   // "storeClient" = Expo Go, everything else is a standalone build
//   return env !== "storeClient";
// };

export const pushToken = {
  register: async (): Promise<string | null> => {
    // Check inside function, not at module level
    const isExpoGo =
      Constants.appOwnership === "expo" ||
      Constants.executionEnvironment === "storeClient";

    console.log("appOwnership:", Constants.appOwnership);
    console.log("executionEnvironment:", Constants.executionEnvironment);
    console.log("isExpoGo:", isExpoGo);

    if (isExpoGo) {
      fetch("https://unum-production.up.railway.app/api/debug/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "EXPO_GO_DETECTED",
          appOwnership: Constants.appOwnership,
          executionEnvironment: Constants.executionEnvironment,
        }),
      }).catch(() => {});
      return null;
    }

    try {
      const Notifications = await import("expo-notifications");

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log("Existing permission status:", existingStatus);
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log("Final permission status:", finalStatus);

      if (finalStatus !== "granted") {
        console.log("Push notification permission denied");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      console.log("Token data:", tokenData);
      const token = tokenData.data;

      fetch("https://unum-production.up.railway.app/api/debug/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {});

      console.log("Token:", token);

      const db = getDb();
      db.runSync(
        `INSERT INTO push_token (id, token, registered_at) VALUES (1, ?, ?)
         ON CONFLICT(id) DO UPDATE SET token = excluded.token, registered_at = excluded.registered_at`,
        [token, Date.now()],
      );

      console.log("Token saved to local DB");

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  },

  get: (): string | null => {
    const isExpoGo =
      Constants.appOwnership === "expo" ||
      Constants.executionEnvironment === "storeClient";
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
