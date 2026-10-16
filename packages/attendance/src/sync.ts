/**
 * Attendance sync manager.
 *
 * Framework-agnostic orchestration of the offline queue:
 *   • entries are scoped to the teacher who captured them (ownerId)
 *   • edits are held as an unsaved `draft` and only moved into the sendable
 *     `pending` set by an explicit `save()` (pressing Save), so a click never
 *     sends a half-finished pass
 *   • one entry processed at a time
 *   • network / 5xx / 408 / 429 failures back off exponentially and stop the pass
 *   • whole-request 4xx marks the entry failed without retrying
 *   • a 401 pauses syncing without touching any entry (no penalty, no loss),
 *     and is resumed once the teacher signs in again
 *   • successful records move to `awaiting` until a roster refetch confirms
 *     them, so the UI never flashes back to stale server values
 *
 * The transport (`post`) and connectivity (`isOnline`) are injected so the
 * manager has no dependency on axios, React or the service worker.
 */
import type {
  AttendanceRecordInput,
  AttendanceResultItem,
  AttendanceRosterRow,
} from '@carecraft/types';
import {
  applyRequestFailure,
  applyServerResults,
  backoffDelayMs,
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

export type AttendanceRequestErrorKind = 'network' | 'server' | 'auth' | 'client';

export class AttendanceRequestError extends Error {
  kind: AttendanceRequestErrorKind;
  status?: number;

  constructor(message: string, kind: AttendanceRequestErrorKind, status?: number) {
    super(message);
    this.name = 'AttendanceRequestError';
    this.kind = kind;
    this.status = status;
  }
}

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

export class AttendanceSyncManager {
  private storage: AttendanceQueueStorage;
  private post: AttendancePostClient;
  private isOnline: () => boolean;
  private now: () => number;

  private entries = new Map<string, AttendanceQueueEntry>();
  private listeners = new Set<(entries: AttendanceQueueEntry[]) => void>();
  private authListeners = new Set<(authRequired: boolean) => void>();
  private inFlight: Promise<SyncSummary> | null = null;

  private ownerId: string | null = null;
  private authRequired = false;

  constructor(options: AttendanceSyncManagerOptions) {
    this.storage = options.storage;
    this.post = options.post;
    this.isOnline = options.isOnline;
    this.now = options.now ?? (() => Date.now());
  }

  async init(): Promise<void> {
    const stored = await this.storage.getAll();
    this.entries = new Map(stored.map((entry) => {
      const normalized = normalizeEntry(entry);
      return [normalized.key, normalized];
    }));
    this.emit();
  }

  /**
   * Scopes the manager to a teacher. Entries captured by anyone else are never
   * returned, synced or rendered. Pass `null` on sign-out.
   */
  setOwner(ownerId: string | null): void {
    if (this.ownerId === ownerId) {
      this.emit();
      return;
    }
    this.ownerId = ownerId;
    this.emit();
  }

  isAuthRequired(): boolean {
    return this.authRequired;
  }

  subscribeAuthRequired(listener: (authRequired: boolean) => void): () => void {
    this.authListeners.add(listener);
    listener(this.authRequired);
    return () => this.authListeners.delete(listener);
  }

  /** Called on a 401 from a roster GET (outside the sync path). */
  flagAuthRequired(): void {
    this.setAuthRequired(true);
  }

  /** Called after a successful sign-in so syncing can resume. */
  clearAuthRequired(): void {
    this.setAuthRequired(false);
  }

  getEntries(): AttendanceQueueEntry[] {
    if (!this.ownerId) return [];
    return this.ownedEntries().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getEntry(sectionId: string, date: string): AttendanceQueueEntry | undefined {
    if (!this.ownerId) return undefined;
    return this.entries.get(queueKey(this.ownerId, sectionId, date));
  }

  subscribe(listener: (entries: AttendanceQueueEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getEntries());
    return () => this.listeners.delete(listener);
  }

  /** Timestamp of the earliest pending backoff, or null when none is waiting. */
  nextWakeAt(): number | null {
    let earliest: number | null = null;
    for (const entry of this.ownedEntries()) {
      if (!entry.pending.length || entry.nextAttemptAt == null) continue;
      if (earliest == null || entry.nextAttemptAt < earliest) earliest = entry.nextAttemptAt;
    }
    return earliest;
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

  async discardEntry(key: string): Promise<void> {
    if (!this.entries.has(key)) {
      await this.storage.delete(key);
      return;
    }
    this.entries.delete(key);
    await this.storage.delete(key);
    this.emit();
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

  syncAll(options?: { force?: boolean }): Promise<SyncSummary> {
    if (this.inFlight) return this.inFlight;
    if (!this.ownerId || this.authRequired || !this.isOnline()) {
      return Promise.resolve({ attempted: 0, succeeded: 0, changed: false });
    }
    this.inFlight = this.runSync(options?.force ?? false).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async runSync(force: boolean): Promise<SyncSummary> {
    const summary: SyncSummary = { attempted: 0, succeeded: 0, changed: false };
    for (const entry of this.getEntries()) {
      // Only committed records are sent; unsaved drafts are held back.
      if (!entry.pending.length) continue;
      const now = this.now();
      if (!force && entry.nextAttemptAt != null && now < entry.nextAttemptAt) continue;

      summary.attempted += 1;
      const outcome = await this.syncEntry(entry);
      if (outcome === 'success') {
        summary.succeeded += 1;
        summary.changed = true;
      } else if (outcome === 'failed') {
        summary.changed = true;
      } else {
        // Network / server / auth: stop the pass.
        break;
      }
    }
    return summary;
  }

  private async syncEntry(
    entry: AttendanceQueueEntry,
  ): Promise<'success' | 'failed' | 'retry' | 'auth'> {
    const sent = entry.pending.map((r) => ({ ...r }));
    try {
      const results = await this.post(entry.sectionId, entry.date, sent);
      const next = applyServerResults(entry, sent, results);
      next.attempts = 0;
      next.nextAttemptAt = null;
      next.lastError = null;
      next.lastSentAt = this.now();
      await this.persist(next);
      // A successful write proves the session is valid again.
      this.setAuthRequired(false);
      return 'success';
    } catch (error) {
      const err =
        error instanceof AttendanceRequestError
          ? error
          : new AttendanceRequestError(
              (error as { message?: string })?.message ?? 'Network request failed',
              'network',
            );

      // Session expired: leave the entry completely untouched, pause syncing
      // and surface a re-authentication prompt.
      if (err.kind === 'auth') {
        this.setAuthRequired(true);
        return 'auth';
      }

      if (err.kind === 'client') {
        await this.persist(applyRequestFailure(entry, sent, err.message));
        return 'failed';
      }

      const attempts = entry.attempts + 1;
      const next: AttendanceQueueEntry = {
        ...entry,
        attempts,
        nextAttemptAt: this.now() + backoffDelayMs(attempts),
        lastError: err.message,
      };
      await this.persist(next);
      return 'retry';
    }
  }

  private ownedEntries(): AttendanceQueueEntry[] {
    if (!this.ownerId) return [];
    const owned: AttendanceQueueEntry[] = [];
    for (const entry of this.entries.values()) {
      if (entry.ownerId === this.ownerId) owned.push(entry);
    }
    return owned;
  }

  private setAuthRequired(value: boolean): void {
    if (this.authRequired === value) return;
    this.authRequired = value;
    for (const listener of this.authListeners) listener(value);
  }

  private async persist(entry: AttendanceQueueEntry): Promise<void> {
    if (isEntryResolved(entry)) {
      this.entries.delete(entry.key);
      await this.storage.delete(entry.key);
    } else {
      this.entries.set(entry.key, entry);
      await this.storage.put(entry);
    }
    this.emit();
  }

  private emit(): void {
    const entries = this.getEntries();
    for (const listener of this.listeners) listener(entries);
  }
}
