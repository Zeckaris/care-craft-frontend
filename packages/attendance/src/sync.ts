/**
 * Attendance sync manager.
 *
 * Thin domain binding over the shared `@carecraft/offline-queue` manager. All of
 * the orchestration (owner scoping, explicit-save drafts, one entry at a time,
 * exponential backoff for network / 5xx / 408 / 429, whole-request 4xx failure,
 * 401 pause/resume, persistence) lives in the generic manager; this file only
 * supplies the attendance-specific entry logic and the section/date helpers the
 * attendance UI calls.
 */
import type {
  AttendanceRecordInput,
  AttendanceResultItem,
  AttendanceRosterRow,
} from '@carecraft/types';
import {
  SyncQueueManager,
  SyncRequestError,
} from '@carecraft/offline-queue';
import {
  applyRequestFailure,
  applyServerResults,
  commitDrafts,
  createEntry,
  isEntryResolved,
  normalizeEntry,
  queueKey,
  reconcileEntryWithRoster,
  setDraftRecords,
  type AttendanceQueueEntry,
  type AttendanceQueueStorage,
} from './queue';
import { recordsEqual } from './records';

/** Re-exported so attendance consumers keep the familiar class name. */
export { SyncRequestError as AttendanceRequestError };
export type AttendanceRequestErrorKind = SyncRequestError['kind'];

export type AttendancePostClient = (
  sectionId: string,
  date: string,
  records: AttendanceRecordInput[],
) => Promise<AttendanceResultItem[]>;

export interface AttendanceSyncManagerOptions {
  storage: AttendanceQueueStorage;
  post: AttendancePostClient;
  isOnline: () => boolean;
  now?: () => number;
}

export interface SyncSummary {
  attempted: number;
  succeeded: number;
  changed: boolean;
}

export class AttendanceSyncManager extends SyncQueueManager<
  AttendanceQueueEntry,
  AttendanceRecordInput,
  AttendanceResultItem
> {
  private post: AttendancePostClient;

  constructor(options: AttendanceSyncManagerOptions) {
    super({ storage: options.storage, isOnline: options.isOnline, now: options.now });
    this.post = options.post;
  }

  protected normalizeEntry(entry: AttendanceQueueEntry): AttendanceQueueEntry {
    return normalizeEntry(entry);
  }

  protected isResolved(entry: AttendanceQueueEntry): boolean {
    return isEntryResolved(entry);
  }

  protected recordsEqual(a: AttendanceRecordInput, b: AttendanceRecordInput): boolean {
    return recordsEqual(a, b);
  }

  protected postEntry(
    entry: AttendanceQueueEntry,
    records: AttendanceRecordInput[],
  ): Promise<AttendanceResultItem[]> {
    return this.post(entry.sectionId, entry.date, records);
  }

  protected applyResults(
    entry: AttendanceQueueEntry,
    sent: AttendanceRecordInput[],
    results: AttendanceResultItem[],
  ): AttendanceQueueEntry {
    return applyServerResults(entry, sent, results);
  }

  protected applyRequestFailure(
    entry: AttendanceQueueEntry,
    sent: AttendanceRecordInput[],
    message: string,
  ): AttendanceQueueEntry {
    return applyRequestFailure(entry, sent, message);
  }

  // ── Section/date helpers used by the attendance screen ────────────────────

  getEntry(sectionId: string, date: string): AttendanceQueueEntry | undefined {
    if (!this.ownerId) return undefined;
    return this.getEntryByKey(queueKey(this.ownerId, sectionId, date));
  }

  async setIntendedRecords(
    sectionId: string,
    date: string,
    records: AttendanceRecordInput[],
    sectionLabel?: string,
  ): Promise<void> {
    if (!this.ownerId) return;
    const key = queueKey(this.ownerId, sectionId, date);
    const existing =
      this.entries.get(key) ?? createEntry(this.ownerId, sectionId, date, sectionLabel);
    const withLabel = sectionLabel ? { ...existing, sectionLabel } : existing;
    const next = setDraftRecords(withLabel, records);
    // Drafts are persisted but never synced until the teacher presses Save.
    await this.persist(next);
  }

  /**
   * Commits the unsaved draft for a section/date so the queue may sync it.
   * A no-op when nothing changed. Offline the entry simply stays queued for the
   * next online pass.
   */
  async save(sectionId: string, date: string): Promise<void> {
    if (!this.ownerId) return;
    const entry = this.getEntry(sectionId, date);
    if (!entry || entry.draft.length === 0) return;
    await this.persist(commitDrafts(entry));
  }

  /** Clears shown skipped/rejected outcomes; removes the entry when empty. */
  async dismissOutcomes(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    await this.persist({ ...entry, outcomes: [], updatedAt: this.now() });
  }

  /** Conflict resolution: accept the server's stored value. */
  async keepServerValue(key: string, studentId: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    const conflicts = entry.conflicts.filter((c) => c.studentId !== studentId);
    await this.persist({ ...entry, conflicts, updatedAt: this.now() });
  }

  /**
   * Conflict resolution: overwrite the server value using the stored
   * `updatedAt` as the new expectation, then resend immediately.
   */
  async overwriteWithMine(key: string, studentId: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;
    const conflict = entry.conflicts.find((c) => c.studentId === studentId);
    if (!conflict) return;
    const pending = [
      ...entry.pending,
      { ...conflict.ours, expectedUpdatedAt: conflict.stored.updatedAt },
    ];
    const conflicts = entry.conflicts.filter((c) => c.studentId !== studentId);
    await this.persist({ ...entry, pending, conflicts, nextAttemptAt: null, updatedAt: this.now() });
    void this.syncAll({ force: true });
  }

  async reconcileWithRoster(
    sectionId: string,
    date: string,
    roster: AttendanceRosterRow[],
    rosterUpdatedAt?: number,
  ): Promise<void> {
    if (!this.ownerId) return;
    const entry = this.getEntry(sectionId, date);
    if (!entry || entry.awaiting.length === 0) return;
    if (entry.lastSentAt != null && rosterUpdatedAt != null && rosterUpdatedAt < entry.lastSentAt) {
      return; // roster predates our write — wait for a fresh fetch
    }
    const next = reconcileEntryWithRoster(entry, roster);
    if (next !== entry) await this.persist(next);
  }
}
