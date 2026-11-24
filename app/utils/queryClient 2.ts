import { QueryClient } from "@tanstack/react-query";

// Singleton QueryClient shared across the app.
// Exported here so non-React code (e.g. background services) can trigger
// cache invalidations without needing a hook or component context.
export const queryClient = new QueryClient({
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
