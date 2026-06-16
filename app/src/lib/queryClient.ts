import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient — mirrors web App.tsx configuration.
 * staleTime: 2 minutes, retry: 1
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});
