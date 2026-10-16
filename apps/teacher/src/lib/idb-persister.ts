/**
 * IndexedDB persister for TanStack Query.
 *
 * Persists the query cache to IndexedDB so recently loaded data
 * (e.g. section list) is still visible when the app opens offline.
 *
 * Uses the `idb` library for a promise-based IDB API.
 * The future offline write-queue (attendance) will share this same
 * database and add its own object-store.
 */
import { openDB, type IDBPDatabase } from 'idb';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const DB_NAME    = 'carecraft-teacher';
const STORE_NAME = 'query-cache';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const idbPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    const db = await getDb();
    await db.put(STORE_NAME, client, 'tanstack-query');
  },

  restoreClient: async () => {
    const db = await getDb();
    return db.get(STORE_NAME, 'tanstack-query');
  },

  removeClient: async () => {
    const db = await getDb();
    await db.delete(STORE_NAME, 'tanstack-query');
  },
};
