/**
 * IndexedDB-backed storage for the attendance offline queue.
 *
 * Survives reload and app restart. One record per (sectionId, date), keyed by
 * the entry's `key`, so entries can be listed, read, upserted and deleted
 * without loading the whole store twice.
 */
import type {
  AttendanceQueueEntry,
  AttendanceQueueStorage,
} from '@carecraft/attendance';
import { getDb, ATTENDANCE_QUEUE_STORE } from '@/lib/idb';

export const attendanceQueueStorage: AttendanceQueueStorage = {
  async getAll() {
    const db = await getDb();
    return db.getAll(ATTENDANCE_QUEUE_STORE) as Promise<AttendanceQueueEntry[]>;
  },

  async get(key: string) {
    const db = await getDb();
    return db.get(ATTENDANCE_QUEUE_STORE, key) as Promise<AttendanceQueueEntry | undefined>;
  },

  async put(entry: AttendanceQueueEntry) {
    const db = await getDb();
    await db.put(ATTENDANCE_QUEUE_STORE, entry, entry.key);
  },

  async delete(key: string) {
    const db = await getDb();
    await db.delete(ATTENDANCE_QUEUE_STORE, key);
  },
};
