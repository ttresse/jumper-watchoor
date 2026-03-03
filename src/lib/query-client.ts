import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for React Query.
 *
 * Configuration:
 * - staleTime: 5 minutes - data considered fresh for this duration
 * - gcTime: 30 minutes - cache kept for this duration after last subscriber
 * - retry: false - don't retry failed queries (we track failed chains separately)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: false, // Don't retry - track failed chains separately
    },
  },
});
