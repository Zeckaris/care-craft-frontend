/** Shared display formatters. Times are always 12-hour with AM/PM. */

/** Formats an ISO timestamp as a 12-hour time, e.g. "2:50 PM". */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Formats an ISO date, e.g. "Oct 12, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Formats an ISO timestamp as a 12-hour date and time, e.g. "Oct 12, 2026, 2:50 PM". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Truncates an id for compact display. */
export function shortId(id: string): string {
  return id.length > 8 ? `…${id.slice(-6)}` : id;
}
