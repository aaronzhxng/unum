import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TabBarProvider } from "./context/TabBarContext";
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
      await storage.initializeDefaultList();
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
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
