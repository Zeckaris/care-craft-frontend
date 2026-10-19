/**
 * Shared IndexedDB connection for the teacher app.
 *
 * One database backs both the persisted TanStack Query cache and the
 * attendance offline queue. Bumping `DB_VERSION` and adding the store in the
 * upgrade callback is the single place new object stores are introduced.
 */
import { openDB, type IDBPDatabase } from 'idb';

export const DB_NAME = 'carecraft-teacher';
export const QUERY_CACHE_STORE = 'query-cache';
export const ATTENDANCE_QUEUE_STORE = 'attendance-queue';
export const GRADES_QUEUE_STORE = 'grades-queue';
export const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(QUERY_CACHE_STORE)) {
          db.createObjectStore(QUERY_CACHE_STORE);
        }
        if (!db.objectStoreNames.contains(ATTENDANCE_QUEUE_STORE)) {
          db.createObjectStore(ATTENDANCE_QUEUE_STORE);
        }
        if (!db.objectStoreNames.contains(GRADES_QUEUE_STORE)) {
          db.createObjectStore(GRADES_QUEUE_STORE);
        }
      },
    });
  }
  return dbPromise;
}
