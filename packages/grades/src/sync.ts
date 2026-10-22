/**
 * Grades sync manager.
 *
 * Domain binding over the shared `@carecraft/offline-queue` manager. Adds the
 * stage-scoped helpers the mark-entry screen calls, sends only the wire fields,
 * and enables the one-shot silent conflict retry.
 */
import type { ClassSheetStudent, MarkResult } from '@carecraft/types';
import {
  SyncQueueManager,
  type SyncQueueStorage,
} from '@carecraft/offline-queue';
import {
  applyRequestFailure,
  applyServerResults,
  commitDrafts,
  createEntry,
  isEntryResolved,
  normalizeEntry,
  queueKey,
  reconcileEntryWithSheet,
  recordsEqual,
  setDraftRecords,
  toWireRecord,
  type GradesQueueEntry,
  type MarkRecord,
  type MarkWireRecord,
  type StageContext,
} from './queue';

export type GradesQueueStorageType = SyncQueueStorage<GradesQueueEntry>;

/** The transport: sends one stage's records and returns the per-record results. */
export type GradesPostClient = (
  ctx: StageContext,
  records: MarkWireRecord[],
) => Promise<MarkResult[]>;

export interface GradesSyncManagerOptions {
  storage: GradesQueueStorageType;
  post: GradesPostClient;
  isOnline: () => boolean;
  now?: () => number;
  onResults?: (entry: GradesQueueEntry, results: MarkResult[]) => void;
}

export interface GradesSummary {
  attempted: number;
  succeeded: number;
  changed: boolean;
}

export class GradesSyncManager extends SyncQueueManager<
  GradesQueueEntry,
  MarkRecord,
  MarkResult
> {
  private post: GradesPostClient;

  constructor(options: GradesSyncManagerOptions) {
    super({
      storage: options.storage,
      isOnline: options.isOnline,
      now: options.now,
      onResults: options.onResults,
    });
    this.post = options.post;
  }

  protected normalizeEntry(entry: GradesQueueEntry): GradesQueueEntry {
    return normalizeEntry(entry);
  }

  protected isResolved(entry: GradesQueueEntry): boolean {
    return isEntryResolved(entry);
  }

  protected recordsEqual(a: MarkRecord, b: MarkRecord): boolean {
    return recordsEqual(a, b);
  }

  protected postEntry(ctx: GradesQueueEntry, records: MarkRecord[]): Promise<MarkResult[]> {
    return this.post(
      {
        sectionId: ctx.sectionId,
        subjectId: ctx.subjectId,
        academicTermId: ctx.academicTermId,
        assessmentTypeId: ctx.assessmentTypeId,
      },
      records.map(toWireRecord),
    );
  }

  protected applyResults(
    entry: GradesQueueEntry,
    sent: MarkRecord[],
    results: MarkResult[],
  ): GradesQueueEntry {
    return applyServerResults(entry, sent, results);
  }

  protected applyRequestFailure(
    entry: GradesQueueEntry,
    sent: MarkRecord[],
    message: string,
  ): GradesQueueEntry {
    return applyRequestFailure(entry, sent, message);
  }

  /** A conflict may silently retry once; process the entry again in this pass. */
  protected reprocessAfterSuccess(entry: GradesQueueEntry): boolean {
    return entry.pending.length > 0;
  }

  // ── Stage-scoped helpers used by the mark-entry screen ────────────────────

  getEntry(ctx: StageContext): GradesQueueEntry | undefined {
    if (!this.ownerId) return undefined;
    return this.getEntryByKey(queueKey(this.ownerId, ctx));
  }

  async setIntendedRecords(
    ctx: StageContext,
    records: MarkRecord[],
    labels: Partial<Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>> = {},
  ): Promise<void> {
    if (!this.ownerId) return;
    const key = queueKey(this.ownerId, ctx);
    const existing = this.entries.get(key) ?? createEntry(this.ownerId, ctx, labels);
    const withLabels = { ...existing, ...stripEmpty(labels) };
    await this.persist(setDraftRecords(withLabels, records));
  }

  /**
   * Commits the unsaved draft for a stage so the queue may sync it. Offline the
   * entry simply stays queued for the next online pass.
   */
  async save(ctx: StageContext): Promise<void> {
    if (!this.ownerId) return;
    const entry = this.getEntry(ctx);
    if (!entry || entry.draft.length === 0) return;
    await this.persist(commitDrafts(entry));
  }

  /** Clears shown skipped/rejected outcomes. */
  async dismissOutcomes(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    await this.persist({ ...entry, outcomes: [], updatedAt: this.now() });
  }

  /** Conflict resolution: accept the server's stored mark. */
  async keepServerValue(key: string, studentId: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    const conflicts = entry.conflicts.filter((c) => c.studentId !== studentId);
    await this.persist({ ...entry, conflicts, updatedAt: this.now() });
  }

  /** Conflict resolution: overwrite the server mark, then resend immediately. */
  async overwriteWithMine(key: string, studentId: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    const conflict = entry.conflicts.find((c) => c.studentId === studentId);
    if (!conflict) return;
    const pending = [
      ...entry.pending,
      { ...conflict.ours, expectedUpdatedAt: conflict.stored?.updatedAt ?? null, retried: true },
    ];
    const conflicts = entry.conflicts.filter((c) => c.studentId !== studentId);
    await this.persist({ ...entry, pending, conflicts, nextAttemptAt: null, updatedAt: this.now() });
    void this.syncAll({ force: true });
  }

  async reconcileWithSheet(
    ctx: StageContext,
    students: ClassSheetStudent[],
    sheetUpdatedAt?: number,
  ): Promise<void> {
    if (!this.ownerId) return;
    const entry = this.getEntry(ctx);
    if (!entry || entry.awaiting.length === 0) return;
    if (entry.lastSentAt != null && sheetUpdatedAt != null && sheetUpdatedAt < entry.lastSentAt) {
      return; // the sheet predates our write - wait for a fresh fetch
    }
    const next = reconcileEntryWithSheet(entry, students);
    if (next !== entry) await this.persist(next);
  }
}

function stripEmpty(
  labels: Partial<Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>>,
): Partial<Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>> {
  const out: Partial<Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>> = {};
  if (labels.sectionLabel) out.sectionLabel = labels.sectionLabel;
  if (labels.subjectName) out.subjectName = labels.subjectName;
  if (labels.typeName) out.typeName = labels.typeName;
  if (labels.maxScore != null) out.maxScore = labels.maxScore;
  return out;
}

/** Convenience: build records from a draft against a sheet (used by the app). */
export { buildDraftRecords, parseScore, summarizeMarks, overlayOf } from './queue';
export type { MarkDraft, MarkDraftValue, MarkRecord, MarkWireRecord, StageContext } from './queue';
