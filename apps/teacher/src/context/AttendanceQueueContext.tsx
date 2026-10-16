/**
 * AttendanceQueueProvider — exposes the app-level offline attendance queue.
 *
 * Owns the sync triggers required by the offline contract:
 *   • app start (on mount, after the persisted queue is loaded)
 *   • reconnect (`online` event)
 *   • app returning to the foreground
 *   • manual retry (via `syncNow`)
 *
 * Failed network / 5xx passes are retried on an exponential backoff schedule
 * derived from the queue's `nextAttemptAt`. A roster refetch is requested after
 * every pass that changed server state, which also drives conflict reconciliation.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  AttendanceRecordInput,
  AttendanceRosterRow,
  SectionAttendanceData,
} from '@carecraft/types';
import type { AttendanceQueueEntry } from '@carecraft/attendance';
import { attendanceSync } from '@/lib/attendance-sync';
import { attendanceRosterQueryKey } from '@/hooks/useAttendanceRoster';
import { useUser } from '@/context/UserContext';

interface AttendanceQueueContextValue {
  entries: AttendanceQueueEntry[];
  pendingCount: number;
  awaitingCount: number;
  conflictCount: number;
  failedCount: number;
  hasUnsynced: boolean;
  syncing: boolean;
  /** True when a 401 paused syncing until the teacher signs in again. */
  authRequired: boolean;
  syncNow: (force?: boolean) => Promise<void>;
  /**
   * Explicitly saves the draft for a section/date. Online this sends now;
   * offline it stays queued on the device.
   */
  saveAttendance: (sectionId: string, date: string) => Promise<void>;
  setIntendedRecords: (
    sectionId: string,
    date: string,
    records: AttendanceRecordInput[],
    sectionLabel?: string,
  ) => Promise<void>;
  discardEntry: (key: string) => Promise<void>;
  dismissOutcomes: (key: string) => Promise<void>;
  keepServerValue: (key: string, studentId: string) => Promise<void>;
  overwriteWithMine: (key: string, studentId: string) => Promise<void>;
  reconcileWithRoster: (
    sectionId: string,
    date: string,
    roster: AttendanceRosterRow[],
    rosterUpdatedAt?: number,
  ) => Promise<void>;
}

const AttendanceQueueContext = createContext<AttendanceQueueContextValue | undefined>(undefined);

function summarize(entries: AttendanceQueueEntry[]) {
  let pendingCount = 0;
  let awaitingCount = 0;
  let conflictCount = 0;
  let failedCount = 0;
  for (const entry of entries) {
    pendingCount += entry.pending.length;
    awaitingCount += entry.awaiting.length;
    conflictCount += entry.conflicts.length;
    failedCount += entry.outcomes.filter((o) => o.action === 'rejected').length;
  }
  return { pendingCount, awaitingCount, conflictCount, failedCount };
}

export function AttendanceQueueProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, sessionKey } = useUser();
  const [entries, setEntries] = useState<AttendanceQueueEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  // Confirm any `awaiting` records against rosters already in the query cache,
  // so successfully-synced overlays clear without needing the page open.
  const reconcileCachedRosters = useCallback(async () => {
    for (const entry of attendanceSync.getEntries()) {
      const state = queryClient.getQueryState(
        attendanceRosterQueryKey(entry.sectionId, entry.date),
      );
      const data = state?.data as SectionAttendanceData | undefined;
      if (!data?.roster) continue;
      await attendanceSync.reconcileWithRoster(
        entry.sectionId,
        entry.date,
        data.roster,
        state?.dataUpdatedAt,
      );
    }
  }, [queryClient]);

  const runSync = useCallback(
    async (force: boolean, notify: boolean) => {
      if (!navigator.onLine) return;
      setSyncing(true);
      try {
        const summary = await attendanceSync.syncAll({ force });
        if (summary.changed) {
          await queryClient.invalidateQueries({ queryKey: ['attendance'] });
          await reconcileCachedRosters();
        }
        const next = attendanceSync.getEntries();
        setEntries(next);
        const { conflictCount, failedCount } = summarize(next);
        if (failedCount > 0) {
          toast.error('Some attendance records were rejected');
        } else if (conflictCount > 0) {
          toast.warning('A saved record was changed elsewhere');
        } else if (notify && summary.changed) {
          toast.success('Attendance saved');
        }
      } finally {
        setSyncing(false);
      }
    },
    [queryClient, reconcileCachedRosters],
  );

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let cancelled = false;

    void attendanceSync.init().then(async () => {
      if (cancelled) return;
      unsubscribe = attendanceSync.subscribe(setEntries);
      await reconcileCachedRosters();
      void runSync(false, false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [runSync, reconcileCachedRosters]);

  // Scope the queue to the signed-in teacher. `sessionKey` changes on every
  // sign-in (including MFA), so re-authenticating the same account resumes a
  // queue that a 401 had paused.
  useEffect(() => {
    attendanceSync.setOwner(user?.id ?? null);
    if (!user) return;
    attendanceSync.clearAuthRequired();
    void runSync(false, false);
  }, [user, sessionKey, runSync]);

  // Reflect pause/resume of syncing driven by auth failures.
  useEffect(() => {
    const unsubscribe = attendanceSync.subscribeAuthRequired(setAuthRequired);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onOnline = () => void runSync(false, false);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void runSync(false, false);
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [runSync]);

  // Schedule a retry when the backoff window of any entry elapses.
  useEffect(() => {
    const wakeAt = attendanceSync.nextWakeAt();
    if (wakeAt == null) return;
    const delay = Math.max(0, wakeAt - Date.now());
    const timer = setTimeout(() => void runSync(false, false), delay);
    return () => clearTimeout(timer);
  }, [entries, runSync]);

  const value = useMemo<AttendanceQueueContextValue>(() => {
    const { pendingCount, awaitingCount, conflictCount, failedCount } = summarize(entries);
    return {
      entries,
      pendingCount,
      awaitingCount,
      conflictCount,
      failedCount,
      hasUnsynced: pendingCount + conflictCount + failedCount > 0,
      syncing,
      authRequired,
      syncNow: (force = true) => runSync(force, true),
      saveAttendance: async (sectionId, date) => {
        const online = navigator.onLine;
        await attendanceSync.save(sectionId, date);
        setEntries(attendanceSync.getEntries());
        if (!online) {
          toast.success('Saved on this device — it will sync when you are online');
          return;
        }
        await runSync(true, true);
        const entry = attendanceSync.getEntry(sectionId, date);
        if (entry && entry.pending.length > 0) {
          toast.info('Saved on this device — syncing will retry automatically');
        }
      },
      setIntendedRecords: (sectionId, date, records, sectionLabel) =>
        attendanceSync.setIntendedRecords(sectionId, date, records, sectionLabel),
      discardEntry: (key) => attendanceSync.discardEntry(key),
      dismissOutcomes: (key) => attendanceSync.dismissOutcomes(key),
      keepServerValue: async (key, studentId) => {
        await attendanceSync.keepServerValue(key, studentId);
        await queryClient.invalidateQueries({ queryKey: ['attendance'] });
      },
      overwriteWithMine: async (key, studentId) => {
        await attendanceSync.overwriteWithMine(key, studentId);
        await runSync(false, false);
      },
      reconcileWithRoster: (sectionId, date, roster, rosterUpdatedAt) =>
        attendanceSync.reconcileWithRoster(sectionId, date, roster, rosterUpdatedAt),
    };
  }, [entries, syncing, authRequired, runSync, queryClient]);

  return (
    <AttendanceQueueContext.Provider value={value}>{children}</AttendanceQueueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAttendanceQueue(): AttendanceQueueContextValue {
  const ctx = useContext(AttendanceQueueContext);
  if (!ctx) throw new Error('useAttendanceQueue must be used within an AttendanceQueueProvider');
  return ctx;
}
