import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PolicyAreasProvider } from "./context/PolicyAreasContext";
import { TabBarProvider } from "./context/TabBarContext";
import { initializeDatabase } from "./utils/database";
import { storage } from "./utils/storage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // data stays fresh for 5 minutes
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Initialize SQLite (creates tables + migrates from AsyncStorage)
      await initializeDatabase();
      // Then initialize default list as before
      storage.initializeDefaultList();
      setIsReady(true);
    };
    init();
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
              <Stack.Screen name="bill/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="official/[id]"
                options={{ headerShown: false }}
              />
            </Stack>
          </TabBarProvider>
        </PolicyAreasProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
