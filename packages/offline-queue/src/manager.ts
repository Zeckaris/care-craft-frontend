/**
 * Generic offline write-queue manager.
 *
 * Framework-agnostic orchestration shared by every domain that writes records
 * offline (attendance, grades, ...). It owns:
 *   • entries scoped to the user who captured them (ownerId)
 *   • one entry processed at a time
 *   • network / 5xx / 408 / 429 failures back off exponentially and stop the pass
 *   • whole-request 4xx marks the entry failed without retrying
 *   • a 401 pauses syncing without touching any entry (no penalty, no loss) and
 *     resumes once the user signs in again
 *   • entries persisted to storage (deleted automatically once resolved)
 *   • subscriptions for the UI
 *
 * The domain supplies the entry-specific logic through the abstract hooks and
 * injects the transport (`postEntry`) and connectivity (`isOnline`), so this
 * manager has no dependency on axios, React or the service worker.
 */
import { backoffDelayMs } from './backoff';
import { extractErrorMessage, SyncRequestError } from './errors';

export interface SyncQueueEntryBase<TRecord> {
  key: string;
  /** The user who captured these records — entries are per-user. */
  ownerId: string;
  /** Unsaved edits. Not synced until the domain commits them. */
  draft: TRecord[];
  /** Committed records awaiting sync. */
  pending: TRecord[];
  /** Committed records acknowledged by the server, awaiting data confirmation. */
  awaiting: TRecord[];
  attempts: number;
  nextAttemptAt: number | null;
  lastError: string | null;
  lastSentAt: number | null;
  updatedAt: number;
}

export interface SyncQueueStorage<TEntry> {
  getAll(): Promise<TEntry[]>;
  get(key: string): Promise<TEntry | undefined>;
  put(entry: TEntry): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SyncQueueManagerOptions<TEntry, TRecord, TResult> {
  storage: SyncQueueStorage<TEntry>;
  isOnline: () => boolean;
  now?: () => number;
  /** Called after a successful POST with the server results (for cache patches). */
  onResults?: (entry: TEntry, results: TResult[]) => void;
}

export interface SyncSummary {
  attempted: number;
  succeeded: number;
  changed: boolean;
}

type Outcome = 'success' | 'failed' | 'retry' | 'auth';

/** Cap on immediate re-processing after a success (grades silent conflict retry). */
const MAX_PASSES = 3;

export abstract class SyncQueueManager<
  TEntry extends SyncQueueEntryBase<TRecord>,
  TRecord,
  TResult,
> {
  protected readonly storage: SyncQueueStorage<TEntry>;
  protected readonly isOnline: () => boolean;
  protected readonly now: () => number;
  private readonly onResults?: (entry: TEntry, results: TResult[]) => void;

  protected readonly entries = new Map<string, TEntry>();
  protected ownerId: string | null = null;

  private readonly listeners = new Set<(entries: TEntry[]) => void>();
  private readonly authListeners = new Set<(authRequired: boolean) => void>();
  private authRequired = false;
  private inFlight: Promise<SyncSummary> | null = null;

  constructor(options: SyncQueueManagerOptions<TEntry, TRecord, TResult>) {
    this.storage = options.storage;
    this.isOnline = options.isOnline;
    this.now = options.now ?? (() => Date.now());
    this.onResults = options.onResults;
  }

  // ── Domain hooks ─────────────────────────────────────────────────────────

  /** Brings an entry loaded from storage up to the current shape. */
  protected abstract normalizeEntry(entry: TEntry): TEntry;

  /** True when the entry has nothing left to send, show or resolve. */
  protected abstract isResolved(entry: TEntry): boolean;

  /** Two intended records are equal when their domain fields match. */
  protected abstract recordsEqual(a: TRecord, b: TRecord): boolean;

  /** Sends one entry's pending records. */
  protected abstract postEntry(entry: TEntry, records: TRecord[]): Promise<TResult[]>;

  /** Applies per-record server results, returning the next entry. */
  protected abstract applyResults(entry: TEntry, sent: TRecord[], results: TResult[]): TEntry;

  /** Handles a whole-request failure: no retry, the entry is marked failed. */
  protected abstract applyRequestFailure(entry: TEntry, sent: TRecord[], message: string): TEntry;

  /**
   * Whether to immediately process an entry again after a successful POST
   * (used for the one-shot silent conflict retry). Defaults to no.
   */
  protected reprocessAfterSuccess(_entry: TEntry): boolean {
    return false;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    const stored = await this.storage.getAll();
    this.entries.clear();
    for (const raw of stored) {
      const normalized = this.normalizeEntry(raw);
      this.entries.set(normalized.key, normalized);
    }
    this.emit();
  }

  /** Scopes the manager to a user. Pass `null` on sign-out. */
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

  /** Called on a 401 outside the sync path (e.g. a data GET). */
  flagAuthRequired(): void {
    this.setAuthRequired(true);
  }

  /** Called after a successful sign-in so syncing can resume. */
  clearAuthRequired(): void {
    this.setAuthRequired(false);
  }

  // ── Reads ────────────────────────────────────────────────────────────────

  getEntries(): TEntry[] {
    return this.ownedEntries().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getEntryByKey(key: string): TEntry | undefined {
    if (!this.ownerId) return undefined;
    const entry = this.entries.get(key);
    return entry && entry.ownerId === this.ownerId ? entry : undefined;
  }

  subscribe(listener: (entries: TEntry[]) => void): () => void {
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

  // ── Writes ───────────────────────────────────────────────────────────────

  async discardEntry(key: string): Promise<void> {
    if (!this.entries.has(key)) {
      await this.storage.delete(key);
      return;
    }
    this.entries.delete(key);
    await this.storage.delete(key);
    this.emit();
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

  protected async persist(entry: TEntry): Promise<void> {
    if (this.isResolved(entry)) {
      this.entries.delete(entry.key);
      await this.storage.delete(entry.key);
    } else {
      this.entries.set(entry.key, entry);
      await this.storage.put(entry);
    }
    this.emit();
  }

  // ── Internals ────────────────────────────────────────────────────────────

  protected ownedEntries(): TEntry[] {
    if (!this.ownerId) return [];
    const owned: TEntry[] = [];
    for (const entry of this.entries.values()) {
      if (entry.ownerId === this.ownerId) owned.push(entry);
    }
    return owned;
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

  private async syncEntry(entry: TEntry): Promise<Outcome> {
    let current = entry;
    for (let pass = 0; pass < MAX_PASSES; pass += 1) {
      const sent = current.pending.map((r) => ({ ...r }));
      try {
        const results = await this.postEntry(current, sent);
        let next = this.applyResults(current, sent, results);
        next = {
          ...next,
          attempts: 0,
          nextAttemptAt: null,
          lastError: null,
          lastSentAt: this.now(),
        };
        await this.persist(next);
        // A successful write proves the session is valid again.
        this.setAuthRequired(false);
        this.onResults?.(next, results);
        if (!this.reprocessAfterSuccess(next) || next.pending.length === 0) return 'success';
        current = next;
      } catch (error) {
        const err =
          error instanceof SyncRequestError
            ? error
            : new SyncRequestError(extractErrorMessage(error, 'Network request failed'), 'network');

        // Session expired: leave the entry completely untouched, pause syncing
        // and surface a re-authentication prompt.
        if (err.kind === 'auth') {
          this.setAuthRequired(true);
          return 'auth';
        }

        if (err.kind === 'client') {
          await this.persist(this.applyRequestFailure(current, sent, err.message));
          return 'failed';
        }

        const attempts = current.attempts + 1;
        const next: TEntry = {
          ...current,
          attempts,
          nextAttemptAt: this.now() + backoffDelayMs(attempts),
          lastError: err.message,
        };
        await this.persist(next);
        return 'retry';
      }
    }
    return 'success';
  }

  private setAuthRequired(value: boolean): void {
    if (this.authRequired === value) return;
    this.authRequired = value;
    for (const listener of this.authListeners) listener(value);
  }

  private emit(): void {
    const entries = this.getEntries();
    for (const listener of this.listeners) listener(entries);
  }
}
