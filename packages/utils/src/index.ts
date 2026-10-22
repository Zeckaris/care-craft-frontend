/**
 * @carecraft/utils
 *
 * General-purpose utilities shared across all CareCraft apps.
 * No antd, react-router-dom, or other UI library imports.
 */

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Capitalises the first letter of a string and lowercases the rest.
 * Returns an empty string when `str` is falsy.
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ---------------------------------------------------------------------------
// Auth / localStorage helpers
// ---------------------------------------------------------------------------

/** Retrieves the serialised user object from localStorage (or null). */
export const getUser = (): unknown => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/** Removes the user entry from localStorage (call on logout). */
export const clearUser = (): void => {
  localStorage.removeItem('user');
};

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Date (or ISO string) as a locale date string.
 *
 * @example formatDate(new Date(), 'en-US') // "October 15, 2026"
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale, options);
};

/**
 * Returns the approximate human-readable time elapsed since `date`.
 * E.g. "2 minutes ago", "3 hours ago", "Yesterday".
 */
export const timeAgo = (date: Date | string): string => {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay} days ago`;
};

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

/**
 * Formats a time as a 12-hour string with AM/PM.
 *
 * Accepts either an `HH:mm` string (24-hour, minutes since midnight) or a
 * number of minutes since midnight. Values that are not a valid time are
 * returned unchanged so callers never render `undefined`.
 *
 * Midnight and noon are handled correctly: `"00:00"`/`0` → `"12:00 AM"`,
 * `"12:00"`/`720` → `"12:00 PM"`.
 *
 * @example formatTime12Hour('08:30') // "8:30 AM"
 * @example formatTime12Hour(890)     // "2:50 PM"
 */
export const formatTime12Hour = (value: string | number): string => {
  let minutes: number;

  if (typeof value === 'number' && Number.isFinite(value)) {
    minutes = Math.round(value);
  } else if (typeof value === 'string') {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
    if (!match) return value;
    minutes = Number(match[1]) * 60 + Number(match[2]);
  } else {
    return String(value);
  }

  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
};

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

export { useDebounce } from './useDebounce.ts';
