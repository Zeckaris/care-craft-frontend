/** Shared presentation for an attendance status: colours and labels. */
import { ATTENDANCE_STATUS_OPTIONS } from '@carecraft/attendance';
import type { AttendanceStatus } from '@carecraft/types';

/** Full-contrast colour treatment for a recorded status. */
export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-[var(--color-success)] text-[var(--color-primary-fg)] border-[var(--color-success)]',
  absent: 'bg-[var(--color-danger)] text-[var(--color-danger-fg)] border-[var(--color-danger)]',
  late: 'bg-[var(--color-warning)] text-[var(--color-warning-fg)] border-[var(--color-warning)]',
  excused: 'bg-[var(--color-info)] text-[var(--color-primary-fg)] border-[var(--color-info)]',
};

/**
 * Resolves a recorded status to its canonical option, tolerating casing so a
 * value that is "Present" rather than "present" is still recognised (and never
 * silently rendered without a highlight).
 */
export function normalizeAttendanceStatus(
  value: string | null | undefined,
): AttendanceStatus | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  const option = ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === key);
  return option ? option.value : null;
}

/** Human label for a recorded status; falls back to the raw value verbatim. */
export function attendanceStatusLabel(value: string): string {
  const option = ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === normalizeAttendanceStatus(value));
  return option?.label ?? value;
}
