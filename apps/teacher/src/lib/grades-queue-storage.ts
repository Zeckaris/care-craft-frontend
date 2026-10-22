/**
 * IndexedDB-backed storage for the grades (mark entry) offline queue.
 *
 * One record per stage, keyed by the entry's `key`, so entries can be listed,
 * read, upserted and deleted without loading the whole store twice. Shares the
 * teacher app's single IndexedDB connection with the attendance queue and the
 * persisted query cache.
 */
import type { GradesQueueEntry, GradesQueueStorage } from '@carecraft/grades';
import { getDb, GRADES_QUEUE_STORE } from '@/lib/idb';

export const gradesQueueStorage: GradesQueueStorage = {
  async getAll() {
    const db = await getDb();
    return db.getAll(GRADES_QUEUE_STORE) as Promise<GradesQueueEntry[]>;
  },

  async get(key: string) {
    const db = await getDb();
    return db.get(GRADES_QUEUE_STORE, key) as Promise<GradesQueueEntry | undefined>;
  },

  async put(entry: GradesQueueEntry) {
    const db = await getDb();
    await db.put(GRADES_QUEUE_STORE, entry, entry.key);
  },

  async delete(key: string) {
    const db = await getDb();
    await db.delete(GRADES_QUEUE_STORE, key);
  },
};
