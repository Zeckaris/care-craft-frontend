/**
 * Attendance constants shared across apps.
 *
 * `ATTENDANCE_EDIT_WINDOW_DAYS` mirrors the backend rule that a teacher may not
 * edit an already-marked record older than this many days. Unmarked students on
 * past dates remain markable. Keep this in sync with the backend if it changes.
 *
 * Sync backoff lives in the shared `@carecraft/offline-queue` package and is
 * re-exported here so existing attendance imports keep working.
 */
export const ATTENDANCE_EDIT_WINDOW_DAYS = 7;

/** School-local timezone the attendance `date` string is expressed in. */
export const SCHOOL_TIMEZONE = 'Africa/Addis_Ababa';

export {
  SYNC_BACKOFF_BASE_MS,
  SYNC_BACKOFF_MAX_MS,
  backoffDelayMs,
} from '@carecraft/offline-queue';
