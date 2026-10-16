/**
 * App — root component for the Teacher application.
 *
 * Sets up:
 *  • TanStack Query with IndexedDB persistence
 *  • User context provider
 *  • React Router
 *  • Sonner toast container (mobile-friendly positioning)
 */
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserProvider } from '@/context/UserContext';
import { BrandingProvider } from '@/context/BrandingContext';
import { AttendanceQueueProvider } from '@/context/AttendanceQueueContext';
import { BRANDING_QUERY_KEY } from '@/lib/query-keys';
import { idbPersister } from '@/lib/idb-persister';
import { router } from '@/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours retention in cache/storage
      staleTime: 1000 * 60 * 5,    // 5 minutes fresh
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: idbPersister,
        // Branding is deliberately never persisted: it must always come fresh
        // from the network, with the localStorage seed only as a first-paint
        // fallback. Anything else risks serving a stale palette.
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            String(query.queryKey[0]) !== BRANDING_QUERY_KEY[0],
        },
      }}
      // Purge any branding persisted by an older build once restore completes,
      // so a returning user can never hydrate a stale palette.
      onSuccess={() => queryClient.removeQueries({ queryKey: BRANDING_QUERY_KEY })}
    >
      <UserProvider>
        <BrandingProvider>
          <AttendanceQueueProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                duration: 3500,
                className: 'font-sans text-sm',
              }}
            />
          </AttendanceQueueProvider>
        </BrandingProvider>
      </UserProvider>
    </PersistQueryClientProvider>
  );
}
