/**
 * App-level attendance sync manager singleton.
 *
 * Bound to the teacher app's IndexedDB queue storage and API client. Kept at
 * module scope so the queue is shared by every component and survives route
 * changes. POSTs never go through the service worker — the queue is app-level.
 */
import { AttendanceSyncManager } from '@carecraft/attendance';
import { attendanceQueueStorage } from '@/lib/attendance-queue-storage';
import { postAttendanceRecords } from '@/services/attendance-api';

export const attendanceSync = new AttendanceSyncManager({
  storage: attendanceQueueStorage,
  post: postAttendanceRecords,
  isOnline: () => navigator.onLine,
});
