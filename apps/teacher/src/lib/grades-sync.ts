/**
 * Grades sync manager factory.
 *
 * Constructed once, inside the GradesQueueProvider, so it can patch the cached
 * class sheet (`onResults`) when the server returns totals/averages. Bound to
 * the app's IndexedDB queue storage and API transport.
 */
import { GradesSyncManager, type GradesQueueEntry } from '@carecraft/grades';
import type { MarkResult } from '@carecraft/types';
import { gradesQueueStorage } from '@/lib/grades-queue-storage';
import { postMarks } from '@/services/grades-api';

export function createGradesSync(
  onResults?: (entry: GradesQueueEntry, results: MarkResult[]) => void,
): GradesSyncManager {
  return new GradesSyncManager({
    storage: gradesQueueStorage,
    post: postMarks,
    isOnline: () => navigator.onLine,
    onResults,
  });
}
