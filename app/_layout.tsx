import { QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PolicyAreasProvider } from "./context/PolicyAreasContext";
import { TabBarProvider } from "./context/TabBarContext";
import UpdateToast from "./global_components/UpdateToast";
import { billCache } from "./utils/billCache";
import {
  getStoreVersionInfo,
  isNewerVersion,
} from "./utils/storeUpdateCheck";
import { initializeDatabase } from "./utils/database";
import { queryClient } from "./utils/queryClient";
import { storage } from "./utils/storage";
import { syncListItemsFromBills } from "./utils/syncListItems";

// Disable system font scaling globally
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const isExpoGo = Constants.appOwnership === "expo";

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      storage.initializeDefaultList();
      syncListItemsFromBills(); // fire and forget — non-blocking
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#fafafa");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  useEffect(() => {
    if (isExpoGo || __DEV__) return;
    const currentVersion = Constants.expoConfig?.version;
    if (!currentVersion) return;

    (async () => {
      const info = await getStoreVersionInfo();
      if (!info) return;
      if (!isNewerVersion(info.version, currentVersion))
        return;
      Alert.alert(
        "Update available",
        `A new version of Unum is available in the ${Platform.OS === "ios" ? "App Store" : "Play Store"}. Update now for the latest features and fixes.`,
        [
          { text: "Later", style: "cancel" },
          {
            text: "Update",
            onPress: () => Linking.openURL(info.storeUrl),
          },
        ],
      );
    })();
  }, []);

  useEffect(() => {
    if (isExpoGo) return;

    const setupNotificationHandler = async () => {
      const Notifications = await import("expo-notifications");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      const invalidateBill = (billId: string) => {
        billCache.clearBill(billId);
        queryClient.invalidateQueries({ queryKey: ["bill", billId] });
      };

      // Handle cold start — app opened from notification
      const initialResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (initialResponse) {
        const data = initialResponse.notification.request.content.data as { billId?: string; officialId?: string };
        if (data?.billId) {
          invalidateBill(data.billId);
          setTimeout(() => router.navigate(`/bill/${data.billId}`), 500);
        } else if (data?.officialId) {
          setTimeout(
            () => router.navigate(`/official/${data.officialId}`),
            500,
          );
        }
      }

      // Handle foreground/background tap
      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as { billId?: string; officialId?: string };
          if (data?.billId) {
            invalidateBill(data.billId);
            router.navigate(`/bill/${data.billId}`);
          } else if (data?.officialId) {
            router.navigate(`/official/${data.officialId}`);
          }
        });

      return () => subscription.remove();
    };

    const cleanup = setupNotificationHandler();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PolicyAreasProvider>
          <TabBarProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, animation: "slide_from_left" }}
              />
              <Stack.Screen
                name="education_tab/[topic]"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // screen has its own edge-swipe strip
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="education_tab/[topic]/[subtopic]"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // screen has its own edge-swipe strip
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="bill/[id]"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // screen has its own edge-swipe strip
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="official/[id]"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // screen has its own edge-swipe strip
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="voter-registration"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="tips"
                options={{
                  headerShown: false,
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="glossary"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // screen has its own edge-swipe strip
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </TabBarProvider>
        </PolicyAreasProvider>
      </QueryClientProvider>
      <UpdateToast />
    </GestureHandlerRootView>
  );
}
