import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PolicyAreasProvider } from "./context/PolicyAreasContext";
import { TabBarProvider } from "./context/TabBarContext";
import { initializeDatabase } from "./utils/database";
import { pushToken } from "./utils/pushToken";
import { storage } from "./utils/storage";
import { syncPreferencesToBackend } from "./utils/syncPreferences";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const isExpoGo = Constants.appOwnership === "expo";

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      storage.initializeDefaultList();
      const token = await pushToken.register();
      if (token) {
        await syncPreferencesToBackend();
      }
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#fafafa");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  useEffect(() => {
    if (isExpoGo) return;

    const setupNotificationHandler = async () => {
      const Notifications = await import("expo-notifications");

      // Handle notification tap when app is foregrounded or backgrounded
      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          if (data?.billId) {
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
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="bill/[id]"
                options={{
                  headerShown: false,
                  gestureEnabled: true,
                  animation: "none",
                }}
              />
              <Stack.Screen
                name="official/[id]"
                options={{
                  headerShown: false,
                  gestureEnabled: true,
                  animation: "none",
                }}
              />
            </Stack>
          </TabBarProvider>
        </PolicyAreasProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
