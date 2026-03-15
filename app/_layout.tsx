import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PolicyAreasProvider } from "./context/PolicyAreasContext";
import { TabBarProvider } from "./context/TabBarContext";
import { initializeDatabase } from "./utils/database";
import { pushToken } from "./utils/pushToken";
import { storage } from "./utils/storage";

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

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      storage.initializeDefaultList();
      pushToken.register();
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#fafafa");
    NavigationBar.setButtonStyleAsync("dark");
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
