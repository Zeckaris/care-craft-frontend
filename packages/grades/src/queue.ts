/**
 * Offline mark-entry queue model.
 *
 * One entry per (owner, section, subject, term, stage). An entry carries:
 *   • `draft`     - unsaved edits the teacher is still making, persisted so they
 *                   survive leaving the screen but never synced until Save
 *   • `pending`   - committed records not yet acknowledged by the server
 *   • `awaiting`  - committed records the server accepted, kept overlaid on the
 *                   sheet until a fresh sheet refetch confirms them
 *   • `conflicts` - committed records the server rejected because the stored
 *                   mark moved on; the teacher decides keep server / use mine
 *   • `outcomes`  - skipped / rejected records to surface, never auto-retried
 *
 * The functions here are pure so they can be unit-tested and reused by any app.
 */
import type { SyncQueueEntryBase } from '@carecraft/offline-queue';
import type {
  ClassSheetStudent,
  MarkResult,
  MarkStoredRecord,
} from '@carecraft/types';

/** A committed or drafted mark. The wire shape omits `baseScore` / `retried`. */
export interface MarkRecord {
  studentId: string;
  score: number;
  /** The student's marksheet timestamp used for optimistic concurrency. */
  expectedUpdatedAt: string | null;
  /**
   * The score this draft was based on (the baseline the teacher saw). Used to
   * decide whether a conflict is a silent retry (changed elsewhere) or a real
   * disagreement needing a teacher decision.
   */
  baseScore: number | null;
  /** Set once a conflict has been silently retried, so it happens at most once. */
  retried?: boolean;
}

/** The stage an entry is scoped to. */
export interface StageContext {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
}

export interface MarkConflict {
  studentId: string;
  ours: MarkRecord;
  stored: MarkStoredRecord | null;
  reason?: string;
}

export interface MarkOutcome {
  studentId: string;
  action: 'skipped' | 'rejected';
  reason?: string;
}

export interface GradesQueueEntry extends SyncQueueEntryBase<MarkRecord> {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
  sectionLabel?: string;
  subjectName?: string;
  typeName?: string;
  maxScore?: number;
  conflicts: MarkConflict[];
  outcomes: MarkOutcome[];
}

export interface GradesQueueStorage {
  getAll(): Promise<GradesQueueEntry[]>;
  get(key: string): Promise<GradesQueueEntry | undefined>;
  put(entry: GradesQueueEntry): Promise<void>;
  delete(key: string): Promise<void>;
}

export function queueKey(
  ownerId: string,
  ctx: StageContext,
): string {
  return `${ownerId}::${ctx.sectionId}::${ctx.subjectId}::${ctx.academicTermId}::${ctx.assessmentTypeId}`;
}

function labelsOf(
  entry: { sectionLabel?: string; subjectName?: string; typeName?: string; maxScore?: number },
): Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'> {
  const out: Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'> = {};
  if (entry.sectionLabel) out.sectionLabel = entry.sectionLabel;
  if (entry.subjectName) out.subjectName = entry.subjectName;
  if (entry.typeName) out.typeName = entry.typeName;
  if (entry.maxScore != null) out.maxScore = entry.maxScore;
  return out;
}

export function createEntry(
  ownerId: string,
  ctx: StageContext,
  labels: Partial<Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>> = {},
): GradesQueueEntry {
  return {
    key: queueKey(ownerId, ctx),
    ownerId,
    sectionId: ctx.sectionId,
    subjectId: ctx.subjectId,
    academicTermId: ctx.academicTermId,
    assessmentTypeId: ctx.assessmentTypeId,
    ...labelsOf(labels),
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

/** Brings an entry loaded from storage up to the current shape. */
export function normalizeEntry(entry: GradesQueueEntry): GradesQueueEntry {
  return {
    ...entry,
    draft: entry.draft ?? [],
    pending: entry.pending ?? [],
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

export function isEntryResolved(entry: GradesQueueEntry): boolean {
  return (
    entry.draft.length === 0 &&
    entry.pending.length === 0 &&
    entry.awaiting.length === 0 &&
    entry.conflicts.length === 0 &&
    entry.outcomes.length === 0
  );
}

export function recordsEqual(a: MarkRecord, b: MarkRecord): boolean {
  return (
    a.studentId === b.studentId &&
    a.score === b.score &&
    a.expectedUpdatedAt === b.expectedUpdatedAt
  );
}

/** The wire shape the write endpoint accepts (no client-only fields). */
export interface MarkWireRecord {
  studentId: string;
  score: number;
  expectedUpdatedAt: string | null;
}

export function toWireRecord(record: MarkRecord): MarkWireRecord {
  return {
    studentId: record.studentId,
    score: record.score,
    expectedUpdatedAt: record.expectedUpdatedAt,
  };
}

/** Overlay of the teacher's intended marks: draft wins over pending, then awaiting. */
export function overlayOf(entry: GradesQueueEntry): Record<string, MarkRecord> {
  const overlay: Record<string, MarkRecord> = {};
  for (const r of entry.awaiting) overlay[r.studentId] = r;
  for (const r of entry.pending) overlay[r.studentId] = r;
  for (const r of entry.draft) overlay[r.studentId] = r;
  return overlay;
}

export function hasUnsyncedWork(entry: GradesQueueEntry): boolean {
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
  entry: GradesQueueEntry,
  records: MarkRecord[],
): GradesQueueEntry {
  return { ...entry, draft: records, updatedAt: Date.now() };
}

/**
 * Commits the draft into `pending`, preserving each student's originally
 * captured `expectedUpdatedAt` so a later sheet refetch never silently upgrades
 * the expectation. Records a draft supersedes are removed from `awaiting`.
 */
export function commitDrafts(entry: GradesQueueEntry): GradesQueueEntry {
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
  entry: GradesQueueEntry,
  sent: MarkRecord[],
  results: MarkResult[],
): GradesQueueEntry {
  const resultByStudent = new Map(results.map((r) => [r.studentId, r]));
  const sentByStudent = new Map(sent.map((r) => [r.studentId, r]));

  const pending: MarkRecord[] = [];
  const awaiting: MarkRecord[] = [...entry.awaiting];
  const outcomes: MarkOutcome[] = [...entry.outcomes];
  const conflicts: MarkConflict[] = [...entry.conflicts];

  for (const cur of entry.pending) {
    const sentRec = sentByStudent.get(cur.studentId);
    const result = resultByStudent.get(cur.studentId);
    if (!sentRec || !result || !recordsEqual(cur, sentRec)) {
      // Edited while the request was in flight - keep for the next pass.
      pending.push(cur);
      continue;
    }
    switch (result.action) {
      case 'created':
      case 'updated': {
        awaiting.push({
          ...cur,
          score: result.score ?? cur.score,
          expectedUpdatedAt: result.updatedAt ?? cur.expectedUpdatedAt,
          baseScore: result.score ?? cur.score,
        });
        break;
      }
      case 'unchanged':
        awaiting.push({ ...cur, baseScore: result.score ?? cur.score });
        break;
      case 'skipped':
        outcomes.push({ studentId: cur.studentId, action: 'skipped', reason: result.reason });
        break;
      case 'rejected':
        outcomes.push({ studentId: cur.studentId, action: 'rejected', reason: result.reason });
        break;
      case 'conflict': {
        const stored = result.stored ?? null;
        const silentRetry =
          stored != null && !cur.retried && stored.score === cur.baseScore;
        if (silentRetry) {
          // The mark changed only elsewhere; re-send once against the new stamp.
          pending.push({ ...cur, expectedUpdatedAt: stored.updatedAt, retried: true });
        } else {
          conflicts.push({
            studentId: cur.studentId,
            ours: cur,
            stored,
            reason: result.reason,
          });
        }
        break;
      }
    }
  }

  return { ...entry, pending, awaiting, outcomes, conflicts, updatedAt: Date.now() };
}

/**
 * Handles a whole-request 4xx: no retry, mark every sent record as rejected
 * with the server message and let the teacher review the entry.
 */
export function applyRequestFailure(
  entry: GradesQueueEntry,
  sent: MarkRecord[],
  message: string,
): GradesQueueEntry {
  const sentByStudent = new Map(sent.map((r) => [r.studentId, r]));
  const pending = entry.pending.filter((cur) => {
    const s = sentByStudent.get(cur.studentId);
    return !(s && recordsEqual(cur, s));
  });
  const outcomes: MarkOutcome[] = [
    ...entry.outcomes,
    ...sent.map((s) => ({ studentId: s.studentId, action: 'rejected' as const, reason: message })),
  ];
  return {
    ...entry,
    pending,
    outcomes,
    attempts: 0,
    nextAttemptAt: null,
    lastError: message,
    updatedAt: Date.now(),
  };
}

/**
 * Reconciles accepted (`awaiting`) records against a fresh class sheet.
 * Confirmed records drop off; records whose server mark moved are surfaced as
 * conflicts rather than overwritten.
 */
export function reconcileEntryWithSheet(
  entry: GradesQueueEntry,
  students: ClassSheetStudent[],
): GradesQueueEntry {
  if (entry.awaiting.length === 0) return entry;

  const byId = new Map(students.map((s) => [s.studentId, s]));
  const awaiting: MarkRecord[] = [];
  const outcomes: MarkOutcome[] = [...entry.outcomes];
  const conflicts: MarkConflict[] = [...entry.conflicts];
  const conflictedIds = new Set(conflicts.map((c) => c.studentId));

  for (const record of entry.awaiting) {
    const student = byId.get(record.studentId);
    if (!student) {
      outcomes.push({ studentId: record.studentId, action: 'skipped', reason: 'Student no longer enrolled' });
      continue;
    }
    const cell = student.scores[entry.assessmentTypeId];
    if (cell?.entered && cell.score === record.score) {
      continue; // confirmed
    }
    if (!conflictedIds.has(record.studentId)) {
      conflicts.push({
        studentId: record.studentId,
        ours: record,
        stored: {
          score: cell?.entered ? cell.score : null,
          updatedAt: student.updatedAt,
        },
        reason: 'The class sheet changed after your save',
      });
      conflictedIds.add(record.studentId);
    }
  }

  return { ...entry, awaiting, outcomes, conflicts, updatedAt: Date.now() };
}

/** The draft value for one student while editing. */
export interface MarkDraftValue {
  /** Raw input text; an empty string means the teacher cleared the field. */
  value: string;
  /** True once the teacher has typed in this field. */
  touched: boolean;
}

export type MarkDraft = Record<string, MarkDraftValue>;

/**
 * Records to persist as the unsaved draft: only students whose intended score
 * differs from the committed baseline (pending / awaiting) or the loaded sheet.
 * `expectedUpdatedAt` keeps the student's marksheet timestamp as the baseline.
 */
export function buildDraftRecords(
  students: ClassSheetStudent[],
  draft: MarkDraft,
  typeId: string,
  pending: MarkRecord[],
  awaiting: MarkRecord[],
): MarkRecord[] {
  const pendingBy = new Map(pending.map((r) => [r.studentId, r]));
  const awaitingBy = new Map(awaiting.map((r) => [r.studentId, r]));

  const out: MarkRecord[] = [];
  for (const student of students) {
    const value = draft[student.studentId];
    if (!value) continue;
    const parsed = parseScore(value.value);
    if (parsed == null) continue; // empty / invalid reverts to the server value

    const base = pendingBy.get(student.studentId) ?? awaitingBy.get(student.studentId);
    const cell = student.scores[typeId];
    const baseEntered = base ? true : Boolean(cell?.entered);
    const baseScore = base ? base.score : (cell?.entered ? cell.score : 0);

    // Entering the same value as the baseline is not a change.
    if (baseEntered && parsed === baseScore) continue;

    out.push({
      studentId: student.studentId,
      score: parsed,
      expectedUpdatedAt: base ? base.expectedUpdatedAt : student.updatedAt,
      baseScore,
    });
  }
  return out;
}

/** Parses a score input, accepting up to two decimals. Returns null when empty/invalid. */
export function parseScore(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export interface MarksProgress {
  entered: number;
  total: number;
}

/** Counts students with an effective entered mark (overlay wins over the sheet). */
export function summarizeMarks(
  students: ClassSheetStudent[],
  typeId: string,
  overlay: Record<string, MarkRecord>,
): MarksProgress {
  let entered = 0;
  for (const student of students) {
    const overlaid = overlay[student.studentId];
    const isEntered = overlaid ? true : Boolean(student.scores[typeId]?.entered);
    if (isEntered) entered += 1;
  }
  return { entered, total: students.length };
}
