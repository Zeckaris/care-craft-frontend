/**
 * Date helpers for attendance.
 *
 * Attendance dates are plain `YYYY-MM-DD` strings in the school's timezone.
 * All arithmetic is done on the calendar date (UTC noon) so it never drifts
 * with DST or the device's own timezone.
 */
import { ATTENDANCE_EDIT_WINDOW_DAYS, SCHOOL_TIMEZONE } from './constants';

const MS_PER_DAY = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Returns today's date as `YYYY-MM-DD` in the school's timezone. */
export function schoolToday(now: Date = new Date()): string {
  const parts = dateFormatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function toUtcMs(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Adds (or subtracts) whole days to a `YYYY-MM-DD` string. */
export function addDays(date: string, days: number): string {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

/** Lexicographic comparison works for `YYYY-MM-DD`; -1 / 0 / 1. */
export function compareDateStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Whole-day difference `to - from`. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** True when `date` is after `today` (both `YYYY-MM-DD`). */
export function isFutureDate(date: string, today: string = schoolToday()): boolean {
  return compareDateStrings(date, today) > 0;
}

/**
 * Whether an already-marked record on `date` is still editable today.
 * Unmarked rows are always editable and must be checked separately.
 */
export function isWithinEditWindow(
  date: string,
  today: string = schoolToday(),
  windowDays: number = ATTENDANCE_EDIT_WINDOW_DAYS,
): boolean {
  return daysBetween(date, today) <= windowDays;
}

/** Human-friendly label, e.g. "Mon, Oct 12, 2026". */
export function formatDisplayDate(date: string, today: string = schoolToday()): string {
  if (date === today) return 'Today';
  if (date === addDays(today, -1)) return 'Yesterday';
  const parsed = new Date(`${date}T12:00:00Z`);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
