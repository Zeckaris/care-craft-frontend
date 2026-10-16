/**
 * Offline attendance queue model.
 *
 * One entry per (owner, sectionId, date). An entry carries:
 *   • `draft`     — unsaved edits the teacher is still making. Persisted so they
 *                   survive leaving the screen, but never synced until Save.
 *   • `pending`   — committed records not yet acknowledged by the server.
 *   • `awaiting`  — committed records the server accepted, kept overlaid on the
 *                   roster until a fresh roster refetch confirms them
 *   • `conflicts` — committed records the server rejected because the stored
 *                   value moved on; the teacher decides whether to keep or
 *                   overwrite
 *   • `outcomes`  — skipped / rejected records to surface, never auto-retried
 *
 * The functions here are pure so they can be unit-tested and reused by any app.
 */
import type {
  AttendanceRecordInput,
  AttendanceResultItem,
  AttendanceRosterRow,
  AttendanceStoredRecord,
} from '@carecraft/types';
import { SYNC_BACKOFF_BASE_MS, SYNC_BACKOFF_MAX_MS } from './constants';
import { normalizeNote, recordsEqual } from './records';

export interface AttendanceConflict {
  studentId: string;
  ours: AttendanceRecordInput;
  stored: AttendanceStoredRecord;
  reason?: string;
}

export interface AttendanceOutcome {
  studentId: string;
  action: 'skipped' | 'rejected';
  reason?: string;
}

export interface AttendanceQueueEntry {
  key: string;
  /** The teacher who captured these records — entries are per-user. */
  ownerId: string;
  sectionId: string;
  date: string;
  sectionLabel?: string;
  /** Unsaved edits. Not synced until the teacher presses Save. */
  draft: AttendanceRecordInput[];
  /** Committed records awaiting sync. */
  pending: AttendanceRecordInput[];
  /** Committed records acknowledged by the server, awaiting roster confirmation. */
  awaiting: AttendanceRecordInput[];
  conflicts: AttendanceConflict[];
  outcomes: AttendanceOutcome[];
  attempts: number;
  nextAttemptAt: number | null;
  lastError: string | null;
  lastSentAt: number | null;
  updatedAt: number;
  /**
   * @deprecated legacy explicit-save flag from an earlier build. Migrated into
   * `draft`/`pending` by `normalizeEntry` on load.
   */
  saved?: boolean;
}

export interface AttendanceQueueStorage {
  getAll(): Promise<AttendanceQueueEntry[]>;
  get(key: string): Promise<AttendanceQueueEntry | undefined>;
  put(entry: AttendanceQueueEntry): Promise<void>;
  delete(key: string): Promise<void>;
}

export function queueKey(ownerId: string, sectionId: string, date: string): string {
  return `${ownerId}::${sectionId}::${date}`;
}

/**
 * Brings an entry loaded from storage up to the current shape. Older builds
 * stored unsaved edits directly in `pending` with `saved: false`; move those
 * into `draft`.
 */
export function normalizeEntry(entry: AttendanceQueueEntry): AttendanceQueueEntry {
  if (Array.isArray(entry.draft)) return entry;
  const legacyDraft = entry.saved === false;
  return {
    key: entry.key,
    ownerId: entry.ownerId,
    sectionId: entry.sectionId,
    date: entry.date,
    ...(entry.sectionLabel ? { sectionLabel: entry.sectionLabel } : {}),
    draft: legacyDraft ? entry.pending : [],
    pending: legacyDraft ? [] : entry.pending,
    awaiting: entry.awaiting ?? [],
    conflicts: entry.conflicts ?? [],
    outcomes: entry.outcomes ?? [],
    attempts: entry.attempts ?? 0,
    nextAttemptAt: entry.nextAttemptAt ?? null,
    lastError: entry.lastError ?? null,
    lastSentAt: entry.lastSentAt ?? null,
    updatedAt: entry.updatedAt ?? Date.now(),
  };
}

export function createEntry(
  ownerId: string,
  sectionId: string,
  date: string,
  sectionLabel?: string,
): AttendanceQueueEntry {
  return {
    key: queueKey(ownerId, sectionId, date),
    ownerId,
    sectionId,
    date,
    ...(sectionLabel ? { sectionLabel } : {}),
    draft: [],
    pending: [],
    awaiting: [],
    conflicts: [],
    outcomes: [],
    attempts: 0,
    nextAttemptAt: null,
    lastError: null,
    lastSentAt: null,
    updatedAt: Date.now(),
  };
}

/** An entry can be removed once it has nothing left to send, show or resolve. */
export function isEntryResolved(entry: AttendanceQueueEntry): boolean {
  return (
    entry.draft.length === 0 &&
    entry.pending.length === 0 &&
    entry.awaiting.length === 0 &&
    entry.conflicts.length === 0 &&
    entry.outcomes.length === 0
  );
}

/**
 * Overlay of the teacher's intended values: saved draft edits win over the
 * committed queue, which wins over the loaded roster.
 */
export function overlayOf(
  entry: AttendanceQueueEntry,
): Record<string, { status: AttendanceRecordInput['status']; note: string }> {
  const overlay: Record<string, { status: AttendanceRecordInput['status']; note: string }> = {};
  for (const r of entry.awaiting) overlay[r.studentId] = { status: r.status, note: normalizeNote(r.note) };
  for (const r of entry.pending) overlay[r.studentId] = { status: r.status, note: normalizeNote(r.note) };
  for (const r of entry.draft) overlay[r.studentId] = { status: r.status, note: normalizeNote(r.note) };
  return overlay;
}

/** True when the entry still has something waiting to sync or resolve. */
export function hasUnsyncedWork(entry: AttendanceQueueEntry): boolean {
  return (
    entry.draft.length > 0 ||
    entry.pending.length > 0 ||
    entry.awaiting.length > 0 ||
    entry.conflicts.length > 0 ||
    entry.outcomes.length > 0
  );
}

/** Replaces the unsaved draft with the teacher's current intended changes. */
export function setDraftRecords(
  entry: AttendanceQueueEntry,
  records: AttendanceRecordInput[],
): AttendanceQueueEntry {
  return { ...entry, draft: records, updatedAt: Date.now() };
}

/**
 * Commits the draft: merges it into `pending`, preserving each student's
 * originally captured `expectedUpdatedAt` so a later roster refetch never
 * silently upgrades the expectation (which would defeat conflict detection).
 * Records a draft supersedes are removed from `awaiting` (they are re-sent).
 */
export function commitDrafts(entry: AttendanceQueueEntry): AttendanceQueueEntry {
  if (entry.draft.length === 0) return entry;
  const draftIds = new Set(entry.draft.map((r) => r.studentId));
  const pendingBy = new Map(entry.pending.map((r) => [r.studentId, r]));

  const pending = entry.pending.filter((r) => !draftIds.has(r.studentId));
  for (const d of entry.draft) {
    const prev = pendingBy.get(d.studentId);
    pending.push(prev ? { ...d, expectedUpdatedAt: prev.expectedUpdatedAt } : d);
  }
  const awaiting = entry.awaiting.filter((r) => !draftIds.has(r.studentId));

  return {
    ...entry,
    draft: [],
    pending,
    awaiting,
    attempts: 0,
    nextAttemptAt: null,
    lastError: null,
    updatedAt: Date.now(),
  };
}

/** Applies per-record server results to the entry after a successful POST. */
export function applyServerResults(
  entry: AttendanceQueueEntry,
  sent: AttendanceRecordInput[],
  results: AttendanceResultItem[],
): AttendanceQueueEntry {
  const resultByStudent = new Map(results.map((r) => [r.studentId, r]));
  const sentByStudent = new Map(sent.map((r) => [r.studentId, r]));

  const pending: AttendanceRecordInput[] = [];
  const awaiting: AttendanceRecordInput[] = [...entry.awaiting];
  const outcomes: AttendanceOutcome[] = [...entry.outcomes];
  const conflicts: AttendanceConflict[] = [...entry.conflicts];

  for (const cur of entry.pending) {
    const sentRec = sentByStudent.get(cur.studentId);
    const result = resultByStudent.get(cur.studentId);
    if (!sentRec || !result || !recordsEqual(cur, sentRec)) {
      // Edited while the request was in flight — keep for the next pass.
      pending.push(cur);
      continue;
    }
    switch (result.action) {
      case 'created':
      case 'updated':
      case 'unchanged':
        awaiting.push(cur);
        break;
      case 'skipped':
        outcomes.push({ studentId: cur.studentId, action: 'skipped', reason: result.reason });
        break;
      case 'rejected':
        outcomes.push({ studentId: cur.studentId, action: 'rejected', reason: result.reason });
        break;
      case 'conflict':
        conflicts.push({
          studentId: cur.studentId,
          ours: cur,
          stored: result.stored ?? { status: cur.status, note: cur.note ?? null, updatedAt: '', markedBy: null },
          reason: result.reason,
        });
        break;
    }
  }

  return { ...entry, pending, awaiting, outcomes, conflicts, updatedAt: Date.now() };
}

/**
 * Handles a whole-request 4xx: no retry, mark every sent record as rejected
 * with the server message and let the teacher discard the entry.
 */
export function applyRequestFailure(
  entry: AttendanceQueueEntry,
  sent: AttendanceRecordInput[],
  message: string,
): AttendanceQueueEntry {
  const sentByStudent = new Map(sent.map((r) => [r.studentId, r]));
  const pending = entry.pending.filter((cur) => {
    const s = sentByStudent.get(cur.studentId);
    return !(s && recordsEqual(cur, s));
  });
  const outcomes: AttendanceOutcome[] = [
    ...entry.outcomes,
    ...sent.map((s) => ({ studentId: s.studentId, action: 'rejected' as const, reason: message })),
  ];
  return { ...entry, pending, outcomes, attempts: 0, nextAttemptAt: null, lastError: message, updatedAt: Date.now() };
}

function storedFromRow(row: AttendanceRosterRow): AttendanceStoredRecord {
  return {
    status: row.status ?? 'present',
    note: row.note ?? null,
    updatedAt: row.updatedAt ?? '',
    markedBy: row.markedBy ?? null,
  };
}

/**
 * Reconciles accepted (`awaiting`) records against a fresh roster. Confirmed
 * records drop off; records whose server value moved are surfaced as conflicts
 * rather than overwritten.
 */
export function reconcileEntryWithRoster(
  entry: AttendanceQueueEntry,
  roster: AttendanceRosterRow[],
): AttendanceQueueEntry {
  if (entry.awaiting.length === 0) return entry;

  const byId = new Map(roster.map((r) => [r.studentId, r]));
  const awaiting: AttendanceRecordInput[] = [];
  const outcomes: AttendanceOutcome[] = [...entry.outcomes];
  const conflicts: AttendanceConflict[] = [...entry.conflicts];
  const conflictedIds = new Set(conflicts.map((c) => c.studentId));

  for (const record of entry.awaiting) {
    const row = byId.get(record.studentId);
    if (!row) {
      outcomes.push({ studentId: record.studentId, action: 'skipped', reason: 'Student no longer enrolled' });
      continue;
    }
    if (row.status === record.status && normalizeNote(row.note) === normalizeNote(record.note)) {
      continue; // confirmed
    }
    if (!conflictedIds.has(record.studentId)) {
      conflicts.push({
        studentId: record.studentId,
        ours: record,
        stored: storedFromRow(row),
        reason: 'The roster changed after your save',
      });
      conflictedIds.add(record.studentId);
    }
  }

  return { ...entry, awaiting, outcomes, conflicts, updatedAt: Date.now() };
}

/** Deterministic exponential backoff for network / 5xx failures. */
export function backoffDelayMs(attempts: number): number {
  const safe = Math.max(1, Math.floor(attempts));
  return Math.min(SYNC_BACKOFF_BASE_MS * 2 ** (safe - 1), SYNC_BACKOFF_MAX_MS);
}
