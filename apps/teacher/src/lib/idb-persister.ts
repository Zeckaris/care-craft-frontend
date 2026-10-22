/**
 * IndexedDB persister for TanStack Query.
 *
 * Persists the query cache to IndexedDB so recently loaded data
 * (e.g. the section list and an opened attendance roster) is still visible
 * when the app opens offline.
 */
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { getDb, QUERY_CACHE_STORE } from '@/lib/idb';

const CLIENT_KEY = 'tanstack-query';

export const idbPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    const db = await getDb();
    await db.put(QUERY_CACHE_STORE, client, CLIENT_KEY);
  },

  restoreClient: async () => {
    const db = await getDb();
    return db.get(QUERY_CACHE_STORE, CLIENT_KEY);
  },

  removeClient: async () => {
    const db = await getDb();
    await db.delete(QUERY_CACHE_STORE, CLIENT_KEY);
  },
};
