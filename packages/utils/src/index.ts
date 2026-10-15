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
// React hooks
// ---------------------------------------------------------------------------

export { useDebounce } from './useDebounce.ts';
