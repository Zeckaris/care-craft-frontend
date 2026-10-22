/**
 * Pure roster / record helpers: naming, change detection, locking and counts.
 */
import type {
  AttendanceRecordInput,
  AttendanceRosterRow,
  AttendanceStatus,
} from '@carecraft/types';
import { ATTENDANCE_EDIT_WINDOW_DAYS } from './constants';
import { daysBetween, schoolToday } from './date';

export interface AttendanceStatusOption {
  value: AttendanceStatus;
  label: string;
  short: string;
}

/** Order used by the status segmented control and the summary bar. */
export const ATTENDANCE_STATUS_OPTIONS: readonly AttendanceStatusOption[] = [
  { value: 'present', label: 'Present', short: 'P' },
  { value: 'absent', label: 'Absent', short: 'A' },
  { value: 'late', label: 'Late', short: 'L' },
  { value: 'excused', label: 'Excused', short: 'E' },
] as const;

/** The draft status/note for a single student. `null` status means unmarked. */
export interface AttendanceDraftValue {
  status: AttendanceStatus | null;
  note?: string | null;
}

export type AttendanceDraft = Record<string, AttendanceDraftValue>;

/** Normalises a note so `null`, `undefined` and whitespace compare equally. */
export function normalizeNote(note?: string | null): string {
  return (note ?? '').trim();
}

/** Two intended records are equal when their status and note match. */
export function recordsEqual(a: AttendanceRecordInput, b: AttendanceRecordInput): boolean {
  return a.status === b.status && normalizeNote(a.note) === normalizeNote(b.note);
}

/** Builds a display name from whichever name fields the API provides. */
export function formatStudentName(row: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}): string {
  if (row.fullName && row.fullName.trim()) return row.fullName.trim();
  const parts = [row.firstName, row.middleName, row.lastName]
    .map((p) => (p ?? '').trim())
    .filter(Boolean);
  return parts.join(' ') || 'Unknown student';
}

/** Best-effort display name for an actor that may be populated or a bare id. */
export function formatActorName(actor: unknown): string {
  if (!actor) return 'Someone';
  if (typeof actor === 'string') return actor;
  const a = actor as { firstName?: string; lastName?: string; email?: string };
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  return name || a.email || 'Someone';
}

/**
 * A record is locked for editing when it is already marked and the date is
 * older than the edit window. Unmarked students on old dates stay editable.
 */
export function isRowLocked(
  row: AttendanceRosterRow,
  date: string,
  today: string = schoolToday(),
): boolean {
  if (row.status == null) return false;
  return daysBetween(date, today) > ATTENDANCE_EDIT_WINDOW_DAYS;
}

/**
 * Produces the list of records to persist for a section/date, i.e. only the
 * students the teacher set or changed relative to the loaded roster. The
 * `expectedUpdatedAt` is the roster row's `updatedAt` (`null` when unmarked).
 */
export function buildChangedRecords(
  roster: AttendanceRosterRow[],
  draft: AttendanceDraft,
): AttendanceRecordInput[] {
  const out: AttendanceRecordInput[] = [];
  for (const row of roster) {
    const value = draft[row.studentId];
    if (!value || value.status == null) continue;
    const note = normalizeNote(value.note);
    const baselineNote = normalizeNote(row.note);
    if (value.status === row.status && note === baselineNote) {
      continue;
    }
    // Send the note when there is one, and also when clearing an existing one
    // (empty string) so the intent to clear is explicit.
    const record: AttendanceRecordInput = {
      studentId: row.studentId,
      status: value.status,
      expectedUpdatedAt: row.updatedAt ?? null,
    };
    if (note || baselineNote) record.note = note;
    out.push(record);
  }
  return out;
}

/**
 * Produces the unsaved draft for a section/date: the records the teacher has
 * changed relative to the committed baseline. The baseline is the committed
 * queue record (pending preferred over awaiting) when present, otherwise the
 * loaded roster — so an already-saved-but-unsynced student is not re-listed as
 * a change, and editing one keeps its original `expectedUpdatedAt`.
 */
export function buildDraftRecords(
  roster: AttendanceRosterRow[],
  draft: AttendanceDraft,
  pending: AttendanceRecordInput[],
  awaiting: AttendanceRecordInput[],
): AttendanceRecordInput[] {
  const pendingBy = new Map(pending.map((r) => [r.studentId, r]));
  const awaitingBy = new Map(awaiting.map((r) => [r.studentId, r]));

  const out: AttendanceRecordInput[] = [];
  for (const row of roster) {
    const value = draft[row.studentId];
    if (!value || value.status == null) continue;

    const note = normalizeNote(value.note);
    const base = pendingBy.get(row.studentId) ?? awaitingBy.get(row.studentId);
    const baseStatus = base ? base.status : row.status;
    const baseNote = base ? normalizeNote(base.note) : normalizeNote(row.note);
    if (value.status === baseStatus && note === baseNote) continue;

    const record: AttendanceRecordInput = {
      studentId: row.studentId,
      status: value.status,
      expectedUpdatedAt: pendingBy.get(row.studentId)?.expectedUpdatedAt ?? row.updatedAt ?? null,
    };
    // Send the note when there is one, and also when clearing an existing one
    // (empty string) so the intent to clear is explicit.
    if (note || baseNote) record.note = note;
    out.push(record);
  }
  return out;
}

export interface AttendanceCounts {
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  marked: number;
  total: number;
}

/**
 * Counts the roster by *effective* status, where the draft/queue overlay wins
 * over the loaded roster value so the counts always reflect the teacher's
 * latest intent.
 */
export function summarizeRoster(
  roster: AttendanceRosterRow[],
  overlay?: Record<string, AttendanceDraftValue>,
): AttendanceCounts {
  const counts: AttendanceCounts = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    unmarked: 0,
    marked: 0,
    total: roster.length,
  };
  for (const row of roster) {
    const status = overlay?.[row.studentId]?.status ?? row.status;
    if (status == null) {
      counts.unmarked += 1;
    } else {
      counts[status] += 1;
      counts.marked += 1;
    }
  }
  return counts;
}
