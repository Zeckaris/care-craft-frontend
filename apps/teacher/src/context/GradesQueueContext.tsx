/**
 * GradesQueueProvider — exposes the app-level offline mark-entry queue.
 *
 * Mirrors the attendance queue contract:
 *   • sync on start, reconnect, foreground and manual retry
 *   • exponential backoff for network / 5xx / 408 / 429
 *   • a 401 pauses syncing and resumes after sign-in
 *   • a class-sheet refetch after every pass that changed server state
 *
 * The queue machinery itself is shared: `GradesSyncManager` extends the generic
 * `@carecraft/offline-queue` manager used by attendance.
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
import {
  gradesKeys,
  type GradesQueueEntry,
  type GradesSyncManager,
  type MarkRecord,
  type StageContext,
} from '@carecraft/grades';
import type { ClassSheetData, ClassSheetStudent, MarkResult } from '@carecraft/types';
import { createGradesSync } from '@/lib/grades-sync';
import { useUser } from '@/context/UserContext';

type EntryLabels = Partial<
  Pick<GradesQueueEntry, 'sectionLabel' | 'subjectName' | 'typeName' | 'maxScore'>
>;

interface GradesQueueContextValue {
  entries: GradesQueueEntry[];
  pendingCount: number;
  awaitingCount: number;
  conflictCount: number;
  failedCount: number;
  hasUnsynced: boolean;
  syncing: boolean;
  /** True when a 401 paused syncing until the teacher signs in again. */
  authRequired: boolean;
  syncNow: (force?: boolean) => Promise<void>;
  /** Replaces the unsaved draft for a stage. */
  setDraft: (ctx: StageContext, records: MarkRecord[], labels?: EntryLabels) => Promise<void>;
  /** Commits + sends the draft for a stage (queues when offline). */
  saveMarks: (ctx: StageContext) => Promise<void>;
  discardEntry: (key: string) => Promise<void>;
  dismissOutcomes: (key: string) => Promise<void>;
  keepServerValue: (key: string, studentId: string) => Promise<void>;
  overwriteWithMine: (key: string, studentId: string) => Promise<void>;
  reconcileWithSheet: (
    ctx: StageContext,
    students: ClassSheetStudent[],
    sheetUpdatedAt?: number,
  ) => Promise<void>;
  getEntry: (ctx: StageContext) => GradesQueueEntry | undefined;
  /** Called when a data GET returns 401, so syncing pauses and the banner shows. */
  flagAuthRequired: () => void;
}

const GradesQueueContext = createContext<GradesQueueContextValue | undefined>(undefined);

function summarize(entries: GradesQueueEntry[]) {
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

/**
 * Patches the cached class sheet from a write's per-record results, so totals
 * and averages update without waiting for a refetch. Only added/updated rows
 * carry a fresh `updatedAt`.
 */
function patchClassSheet(
  queryClient: ReturnType<typeof useQueryClient>,
  entry: GradesQueueEntry,
  results: MarkResult[],
): void {
  const key = gradesKeys.classSheet(entry.sectionId, entry.subjectId, entry.academicTermId);
  const existing = queryClient.getQueryData<ClassSheetData>(key);
  if (!existing) return;

  const resultByStudent = new Map(results.map((r) => [r.studentId, r]));
  let changed = false;
  const students = existing.students.map((student) => {
    const result = resultByStudent.get(student.studentId);
    if (
      !result ||
      (result.action !== 'created' &&
        result.action !== 'updated' &&
        result.action !== 'unchanged')
    ) {
      return student;
    }
    changed = true;
    const cell = student.scores[entry.assessmentTypeId];
    return {
      ...student,
      scores: {
        ...student.scores,
        [entry.assessmentTypeId]: {
          score: result.score ?? cell?.score ?? null,
          entered: true,
        },
      },
      total: result.total ?? student.total,
      average: result.average ?? student.average,
      updatedAt: result.updatedAt ?? student.updatedAt,
    };
  });

  if (changed) queryClient.setQueryData<ClassSheetData>(key, { ...existing, students });
}

export function GradesQueueProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, sessionKey } = useUser();
  const [entries, setEntries] = useState<GradesQueueEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const gradesSync: GradesSyncManager = useMemo(
    () => createGradesSync((entry, results) => patchClassSheet(queryClient, entry, results)),
    [queryClient],
  );

  // Confirm accepted (`awaiting`) records against sheets already in the cache.
  const reconcileCachedSheets = useCallback(async () => {
    for (const entry of gradesSync.getEntries()) {
      const key = gradesKeys.classSheet(entry.sectionId, entry.subjectId, entry.academicTermId);
      const state = queryClient.getQueryState<ClassSheetData>(key);
      if (!state?.data?.students) continue;
      await gradesSync.reconcileWithSheet(
        {
          sectionId: entry.sectionId,
          subjectId: entry.subjectId,
          academicTermId: entry.academicTermId,
          assessmentTypeId: entry.assessmentTypeId,
        },
        state.data.students,
        state.dataUpdatedAt,
      );
    }
  }, [gradesSync, queryClient]);

  const runSync = useCallback(
    async (force: boolean, notify: boolean) => {
      if (!navigator.onLine) return;
      setSyncing(true);
      try {
        const summary = await gradesSync.syncAll({ force });
        if (summary.changed) {
          await queryClient.invalidateQueries({ queryKey: gradesKeys.classSheets() });
          await reconcileCachedSheets();
        }
        const next = gradesSync.getEntries();
        setEntries(next);
        const { conflictCount, failedCount } = summarize(next);
        if (failedCount > 0) {
          toast.error('Some marks were rejected');
        } else if (conflictCount > 0) {
          toast.warning('A saved mark was changed elsewhere');
        } else if (notify && summary.changed) {
          toast.success('Marks saved');
        }
      } finally {
        setSyncing(false);
      }
    },
    [gradesSync, queryClient, reconcileCachedSheets],
  );

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let cancelled = false;

    void gradesSync.init().then(async () => {
      if (cancelled) return;
      unsubscribe = gradesSync.subscribe(setEntries);
      await reconcileCachedSheets();
      void runSync(false, false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [gradesSync, runSync, reconcileCachedSheets]);

  // Scope the queue to the signed-in teacher; a 401 pause resumes on re-login.
  useEffect(() => {
    gradesSync.setOwner(user?.id ?? null);
    if (!user) return;
    gradesSync.clearAuthRequired();
    void runSync(false, false);
  }, [user, sessionKey, gradesSync, runSync]);

  useEffect(() => gradesSync.subscribeAuthRequired(setAuthRequired), [gradesSync]);

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

  useEffect(() => {
    const wakeAt = gradesSync.nextWakeAt();
    if (wakeAt == null) return;
    const delay = Math.max(0, wakeAt - Date.now());
    const timer = setTimeout(() => void runSync(false, false), delay);
    return () => clearTimeout(timer);
  }, [entries, gradesSync, runSync]);

  const value = useMemo<GradesQueueContextValue>(() => {
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
      setDraft: (ctx, records, labels) => gradesSync.setIntendedRecords(ctx, records, labels),
      saveMarks: async (ctx) => {
        const online = navigator.onLine;
        await gradesSync.save(ctx);
        setEntries(gradesSync.getEntries());
        if (!online) {
          toast.success('Saved on this device. It will sync when you are online');
          return;
        }
        await runSync(true, true);
        const entry = gradesSync.getEntry(ctx);
        if (entry && entry.pending.length > 0) {
          toast.info('Saved on this device. Syncing will retry automatically');
        }
      },
      discardEntry: (key) => gradesSync.discardEntry(key),
      dismissOutcomes: (key) => gradesSync.dismissOutcomes(key),
      keepServerValue: async (key, studentId) => {
        await gradesSync.keepServerValue(key, studentId);
        await queryClient.invalidateQueries({ queryKey: gradesKeys.classSheets() });
      },
      overwriteWithMine: async (key, studentId) => {
        await gradesSync.overwriteWithMine(key, studentId);
        await runSync(false, false);
      },
      reconcileWithSheet: (ctx, students, sheetUpdatedAt) =>
        gradesSync.reconcileWithSheet(ctx, students, sheetUpdatedAt),
      getEntry: (ctx) => gradesSync.getEntry(ctx),
      flagAuthRequired: () => gradesSync.flagAuthRequired(),
    };
  }, [entries, syncing, authRequired, runSync, gradesSync, queryClient]);

  return <GradesQueueContext.Provider value={value}>{children}</GradesQueueContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGradesQueue(): GradesQueueContextValue {
  const ctx = useContext(GradesQueueContext);
  if (!ctx) throw new Error('useGradesQueue must be used within a GradesQueueProvider');
  return ctx;
}
