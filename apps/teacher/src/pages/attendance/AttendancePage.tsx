/**
 * AttendancePage — take attendance for one section on one date.
 *
 * Mobile-first and thumb-friendly, but laid out to also work in the desktop
 * shell. Offline-capable: edits are written to the persistent queue instantly,
 * synced when online, and only ever conflict-resolved by explicit teacher choice.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Lock,
  Pencil,
  RefreshCw,
  Save,
} from 'lucide-react';
import {
  addDays,
  AttendanceRequestError,
  buildDraftRecords,
  formatDisplayDate,
  isFutureDate,
  isRowLocked,
  normalizeNote,
  overlayOf,
  schoolToday,
  summarizeRoster,
  type AttendanceDraft,
} from '@carecraft/attendance';
import type { AttendanceStatus } from '@carecraft/types';
import { useMySections } from '@/hooks/useMySections';
import { useAttendanceRoster } from '@/hooks/useAttendanceRoster';
import { useAttendanceQueue } from '@/context/AttendanceQueueContext';
import { attendanceSync } from '@/lib/attendance-sync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatSectionLabel } from '@/lib/section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { StudentAttendanceRow } from '@/components/attendance/StudentAttendanceRow';
import { AttendanceSummaryBar } from '@/components/attendance/AttendanceSummaryBar';
import { SyncQueuePanel } from '@/components/attendance/SyncQueuePanel';

export default function AttendancePage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const today = schoolToday();

  const [date, setDate] = useState(today);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  // Locking is per day — switching dates always returns to the locked view.
  useEffect(() => {
    setEditing(false);
  }, [date, sectionId]);

  const { sections } = useMySections();
  const sectionItem = sections.find((s) => s.section._id === sectionId);
  const readOnly = Boolean(sectionItem) && !sectionItem?.isHomeroom;
  const sectionLabel = formatSectionLabel(sectionItem?.section) || 'Attendance';

  const { data, dataUpdatedAt, isLoading, isFetching, error, refetch } = useAttendanceRoster(
    sectionId,
    date,
  );
  const {
    entries,
    conflictCount,
    failedCount,
    syncing,
    syncNow,
    saveAttendance,
    setIntendedRecords,
    reconcileWithRoster,
  } = useAttendanceQueue();

  const entry = entries.find((e) => e.sectionId === sectionId && e.date === date);
  const roster = useMemo(() => data?.roster ?? [], [data]);

  const overlayMap = useMemo(() => (entry ? overlayOf(entry) : {}), [entry]);

  const draftMap = useMemo<AttendanceDraft>(() => {
    const map: AttendanceDraft = {};
    for (const row of roster) {
      const overlaid = overlayMap[row.studentId];
      map[row.studentId] = overlaid
        ? { status: overlaid.status, note: overlaid.note }
        : { status: row.status, note: row.note ?? '' };
    }
    return map;
  }, [roster, overlayMap]);

  const counts = useMemo(() => summarizeRoster(roster, draftMap), [roster, draftMap]);
  const conflictedIds = useMemo(
    () => new Set(entry?.conflicts.map((c) => c.studentId) ?? []),
    [entry],
  );

  const pendingIds = useMemo(
    () => new Set(entry?.pending.map((r) => r.studentId) ?? []),
    [entry],
  );
  const awaitingIds = useMemo(
    () => new Set(entry?.awaiting.map((r) => r.studentId) ?? []),
    [entry],
  );
  const draftIds = useMemo(() => new Set(entry?.draft.map((r) => r.studentId) ?? []), [entry]);

  /**
   * A student is "saved" when the server has a record for them or their status
   * was committed with Save (pending or acknowledged) — but a student the
   * teacher is currently re-editing (has an unsaved draft) is treated as active.
   */
  const isSavedStudent = (studentId: string, serverStatus: AttendanceStatus | null) =>
    serverStatus != null || pendingIds.has(studentId) || awaitingIds.has(studentId);
  const isSavedRow = (studentId: string, serverStatus: AttendanceStatus | null) =>
    isSavedStudent(studentId, serverStatus) && !draftIds.has(studentId);

  const hasSavedRows = roster.some((row) => isSavedStudent(row.studentId, row.status));

  // Unsaved = the teacher is still editing this draft (nothing has been sent).
  const unsavedCount = entry?.draft.length ?? 0;
  // Queued = explicitly saved records waiting to sync / resolve on the device.
  const hasQueuedWork = Boolean(
    entry &&
      (entry.pending.length || entry.awaiting.length || entry.conflicts.length || entry.outcomes.length),
  );

  // Reconcile accepted records against a freshly fetched roster.
  useEffect(() => {
    if (!sectionId || !data?.roster) return;
    void reconcileWithRoster(sectionId, date, data.roster, dataUpdatedAt);
  }, [sectionId, date, data, dataUpdatedAt, reconcileWithRoster]);

  // A 401 while fetching the roster means the session expired: pause syncing
  // and surface the sign-in prompt rather than showing a generic load error.
  useEffect(() => {
    if (error instanceof AttendanceRequestError && error.kind === 'auth') {
      attendanceSync.flagAuthRequired();
    }
  }, [error]);

  const applyDraft = (next: AttendanceDraft) => {
    if (!sectionId) return;
    const records = buildDraftRecords(roster, next, entry?.pending ?? [], entry?.awaiting ?? []);
    void setIntendedRecords(sectionId, date, records, sectionLabel);
  };

  const handleSave = () => {
    if (!sectionId || unsavedCount === 0) return;
    setEditing(false);
    void saveAttendance(sectionId, date);
  };

  const handleStatus = (studentId: string, status: AttendanceStatus) => {
    const current = draftMap[studentId];
    applyDraft({
      ...draftMap,
      [studentId]: { status, note: current?.note ?? '' },
    });
  };

  const handleNote = (studentId: string, note: string) => {
    const current = draftMap[studentId];
    if (!current || current.status == null) return;
    applyDraft({ ...draftMap, [studentId]: { status: current.status, note } });
  };

  const handleMarkAllPresent = () => {
    const next: AttendanceDraft = { ...draftMap };
    for (const row of roster) {
      // Existing records stay put — only students who are not saved are marked.
      if (isSavedStudent(row.studentId, row.status)) continue;
      if (isRowLocked(row, date, today)) continue;
      if (conflictedIds.has(row.studentId)) continue;
      next[row.studentId] = { status: 'present', note: next[row.studentId]?.note ?? row.note ?? '' };
    }
    applyDraft(next);
  };

  const changeDate = (next: string) => {
    if (!next || isFutureDate(next, today)) return;
    setDate(next);
  };

  const canGoForward = date < today;
  const offlineNoData = !online && !data && !isLoading;

  return (
    <>
      <div className="fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button
          id="attendance-back"
          variant="ghost"
          size="sm"
          className="-ml-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {readOnly && (
            <Badge variant="neutral">
              <Lock size={12} className="mr-1 inline" /> Read-only
            </Badge>
          )}
          {hasQueuedWork && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="rounded-full border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-1 text-xs font-semibold text-[var(--color-warning)]"
            >
              Saved on device
            </button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {sectionLabel}
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">Attendance</p>
      </div>

      {readOnly && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          You are a subject teacher for this section, so attendance is read-only.
        </div>
      )}

      {/* Date + summary controls */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => changeDate(addDays(date, -1))}
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="relative min-w-0 flex-1">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <Input
                id="attendance-date"
                type="date"
                value={date}
                max={today}
                onChange={(e) => changeDate(e.target.value)}
                className="pl-9"
                aria-label="Attendance date"
              />
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={!canGoForward}
              onClick={() => changeDate(addDays(date, 1))}
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {formatDisplayDate(date, today)}
            </span>
            {date !== today && (
              <button
                type="button"
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                onClick={() => setDate(today)}
              >
                Jump to today
              </button>
            )}
          </div>

          <AttendanceSummaryBar
            counts={counts}
            onMarkAllPresent={handleMarkAllPresent}
            showMarkAll={!readOnly && roster.length > 0}
          />
        </CardContent>
      </Card>

      {/* Offline / pending banner */}
      {hasQueuedWork && (
        <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
          <CloudOff size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Saved on this device
              {entry && entry.pending.length > 0 ? ` — ${entry.pending.length} waiting to sync` : ''}
            </p>
            <p className="mt-0.5 text-[var(--color-text-secondary)]">
              {conflictCount > 0
                ? 'Some records clash with changes made elsewhere.'
                : failedCount > 0
                  ? 'Some records were rejected by the server.'
                  : 'They will sync automatically when you are online.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="shrink-0 text-xs font-bold text-[var(--color-warning)] underline"
          >
            Review
          </button>
        </div>
      )}

      {/* Roster */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && error && !data && (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load the roster
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {(error as Error)?.message ?? 'Please try again.'}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {offlineNoData && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CloudOff size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">You are offline</p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              This roster has not been opened on this device yet, so it cannot be shown
              offline. Connect once to make today's rosters available.
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {isFetching && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <RefreshCw size={12} className="animate-spin" /> Refreshing roster…
            </p>
          )}

          {roster.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                No students are enrolled in this section.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              {roster.map((row, index) => {
                const value = draftMap[row.studentId];
                const tooOld = isRowLocked(row, date, today);
                const conflicted = conflictedIds.has(row.studentId);
                const saved = isSavedRow(row.studentId, row.status);
                return (
                  <StudentAttendanceRow
                    key={row.studentId}
                    rowNumber={index + 1}
                    row={row}
                    status={value?.status ?? null}
                    note={normalizeNote(value?.note)}
                    locked={tooOld}
                    saved={saved}
                    editable={editing}
                    readOnly={readOnly}
                    conflicted={conflicted}
                    onChangeStatus={(status) => handleStatus(row.studentId, status)}
                    onCommitNote={(note) => handleNote(row.studentId, note)}
                  />
                );
              })}
            </div>
          )}

          {roster.some((row) => isRowLocked(row, date, today)) && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Lock size={12} />
              Records older than the 7-day edit window are locked. Unmarked students can still be marked.
            </p>
          )}

          {conflictCount > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-warning)]">
              <AlertTriangle size={13} /> Some rows conflict with server changes — resolve them in
              "Saved on device".
            </p>
          )}
        </>
      )}

      {/* Reserve scroll space so the fixed action bar never covers the last row. */}
      {!readOnly && roster.length > 0 && <div className="h-24 lg:h-20" aria-hidden />}
      </div>

      {/*
        Kept outside the .fade-in wrapper: that wrapper retains a transform
        (animation fill-mode: both), which would make it the containing block
        for this fixed bar and pin it over the last row instead of the viewport.
      */}
      {!readOnly && roster.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-20 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-nav)] lg:bottom-0 lg:left-64 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
            {(hasSavedRows || editing) && (
              <Button
                id="attendance-edit"
                variant="secondary"
                className="h-12 shrink-0"
                aria-pressed={editing}
                onClick={() => setEditing((v) => !v)}
              >
                <Pencil size={16} />
                {editing ? 'Done' : 'Edit'}
              </Button>
            )}
            <Button
              id="attendance-save"
              className="flex-1"
              disabled={unsavedCount === 0}
              loading={syncing}
              onClick={handleSave}
            >
              <Save size={16} />
              {unsavedCount > 0 ? `Save attendance (${unsavedCount})` : 'Save attendance'}
            </Button>
            {hasQueuedWork && (
              <Button
                id="attendance-sync-now"
                variant="secondary"
                size="icon"
                className="h-12 w-12 shrink-0"
                aria-label="Sync now"
                loading={syncing}
                onClick={() => void syncNow(true)}
              >
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>
      )}

      <SyncQueuePanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
