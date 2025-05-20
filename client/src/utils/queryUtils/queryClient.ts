import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour default staleTime
      gcTime: 1000 * 60 * 60 * 2, // 2 hours default gcTime
      retry: 2, // Add retry attempts
    },
  },
});

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage, // Use localStorage to persist data
});

// Enable persistence for the query client
void persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
});

export default queryClient;
