/**
 * Attendance constants shared across apps.
 *
 * `ATTENDANCE_EDIT_WINDOW_DAYS` mirrors the backend rule that a teacher may not
 * edit an already-marked record older than this many days. Unmarked students on
 * past dates remain markable. Keep this in sync with the backend if it changes.
 */
export const ATTENDANCE_EDIT_WINDOW_DAYS = 7;

/** School-local timezone the attendance `date` string is expressed in. */
export const SCHOOL_TIMEZONE = 'Africa/Addis_Ababa';

/** Base delay for exponential backoff on network / 5xx sync failures. */
export const SYNC_BACKOFF_BASE_MS = 5_000;

/** Maximum delay for exponential backoff. */
export const SYNC_BACKOFF_MAX_MS = 5 * 60_000;
