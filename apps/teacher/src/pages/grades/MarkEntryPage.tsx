/**
 * MarkEntryPage — enter marks for one conducted assessment stage.
 *
 * Offline-capable: edits are written to the persistent queue, sent when online
 * (or queued when not) and only ever conflict-resolved by explicit teacher
 * choice. Only changed students are sent; empty inputs revert to the server.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CloudOff,
  Lock,
  RefreshCw,
  Save,
} from 'lucide-react';
import {
  buildDraftRecords,
  overlayOf,
  parseScore,
  type MarkDraft,
  type StageContext,
} from '@carecraft/grades';
import type { ClassSheetStudent } from '@carecraft/types';
import { useMySections } from '@/hooks/useMySections';
import { useClassSheet } from '@/hooks/grades';
import { useGradeTerm } from '@/hooks/useGradeTerm';
import { useGradesQueue } from '@/context/GradesQueueContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatSectionLabel } from '@/lib/section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { GradesQueuePanel } from '@/components/grades/GradesQueuePanel';
import { cn } from '@/lib/utils';

function baselineScore(student: ClassSheetStudent, typeId: string): number {
  const cell = student.scores[typeId];
  if (!cell) return 0;
  return cell.score ?? 0;
}

export default function MarkEntryPage() {
  const { sectionId, subjectId, typeId } = useParams<{
    sectionId: string;
    subjectId: string;
    typeId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const { sections } = useMySections();
  const sectionItem = sections.find((s) => s.section._id === sectionId);
  const subject = sectionItem?.subjects.find((s) => s._id === subjectId);
  const sectionLabel = formatSectionLabel(sectionItem?.section);
  const schoolYear = sectionItem?.section.schoolYear;

  const { termId: defaultTermId } = useGradeTerm(schoolYear);
  const termParam = searchParams.get('term') ?? undefined;
  const termId = termParam ?? defaultTermId;

  const { data, dataUpdatedAt, isLoading, error, refetch } = useClassSheet(
    sectionId,
    subjectId,
    termId,
  );
  const { hasUnsynced, setDraft, saveMarks, getEntry, reconcileWithSheet, flagAuthRequired } =
    useGradesQueue();
  const [panelOpen, setPanelOpen] = useState(false);

  const column = useMemo(
    () => data?.columns.find((c) => c.typeId === typeId) ?? null,
    [data, typeId],
  );

  const ctx: StageContext | null = useMemo(() => {
    if (!sectionId || !subjectId || !termId || !typeId) return null;
    return { sectionId, subjectId, academicTermId: termId, assessmentTypeId: typeId };
  }, [sectionId, subjectId, termId, typeId]);

  const entry = ctx ? getEntry(ctx) : undefined;
  const overlay = useMemo(() => (entry ? overlayOf(entry) : {}), [entry]);

  const [values, setValues] = useState<Record<string, string>>({});
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const dirtyRef = useRef<Set<string>>(new Set());
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed inputs from the queue overlay (wins) or the sheet, skipping rows the
  // teacher has edited locally so a background refetch never clobbers them.
  useEffect(() => {
    if (!data?.students || !typeId) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const student of data.students) {
        if (dirtyRef.current.has(student.studentId)) continue;
        const overlaid = overlay[student.studentId];
        next[student.studentId] = String(overlaid ? overlaid.score : baselineScore(student, typeId));
      }
      return next;
    });
  }, [data, overlay, typeId]);

  const buildRecords = useCallback(() => {
    if (!data?.students || !typeId) return [];
    const draft: MarkDraft = {};
    for (const student of data.students) {
      draft[student.studentId] = {
        value: valuesRef.current[student.studentId] ?? '',
        touched: dirtyRef.current.has(student.studentId),
      };
    }
    return buildDraftRecords(
      data.students,
      draft,
      typeId,
      entry?.pending ?? [],
      entry?.awaiting ?? [],
    );
  }, [data, typeId, entry]);

  const flushDraft = useCallback(async () => {
    if (!ctx) return;
    await setDraft(ctx, buildRecords(), {
      sectionLabel,
      subjectName: subject?.name,
      typeName: column?.name,
      maxScore: column?.maxScore,
    });
  }, [ctx, buildRecords, setDraft, sectionLabel, subject?.name, column?.name, column?.maxScore]);

  const scheduleFlush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void flushDraft(), 500);
  }, [flushDraft]);

  // Flush any pending draft when leaving the screen.
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Reconcile accepted marks against the freshly fetched sheet.
  useEffect(() => {
    if (!ctx || !data?.students) return;
    void reconcileWithSheet(ctx, data.students, dataUpdatedAt);
  }, [ctx, data, dataUpdatedAt, reconcileWithSheet]);

  useEffect(() => {
    // 401s are surfaced by the shared API error kind.
    if (error && (error as { kind?: string }).kind === 'auth') flagAuthRequired();
  }, [error, flagAuthRequired]);

  const orderedStudents = useMemo<ClassSheetStudent[]>(() => data?.students ?? [], [data]);
  const maxScore = column?.maxScore ?? 10;
  const locked = column?.state === 'locked';
  const notConducted = column?.state === 'not-conducted';
  const editable = column?.state === 'conducted';

  const progress = useMemo(() => {
    let entered = 0;
    for (const student of orderedStudents) {
      const overlaid = overlay[student.studentId];
      const dirty = dirtyRef.current.has(student.studentId);
      const value = values[student.studentId];
      const cell = student.scores[typeId as string];
      const hasValue = dirty ? parseScore(value ?? '') != null : Boolean(cell?.entered);
      if (overlaid || cell?.entered || (dirty && hasValue)) entered += 1;
    }
    return { entered, total: orderedStudents.length };
  }, [orderedStudents, overlay, values, typeId]);

  // Count changes already committed to the queue plus edits still within the
  // debounce window, so the Save button reacts the moment the teacher types.
  const localChanged = orderedStudents.reduce((count, student) => {
    if (!dirtyRef.current.has(student.studentId)) return count;
    const parsed = parseScore(values[student.studentId] ?? '');
    if (parsed == null) return count;
    const base = overlay[student.studentId];
    const cell = student.scores[typeId as string];
    const baseEntered = base ? true : Boolean(cell?.entered);
    const baseScore = base ? base.score : cell?.entered ? (cell.score ?? 0) : 0;
    if (baseEntered && parsed === baseScore) return count;
    return count + 1;
  }, 0);
  const changedCount = Math.max(entry?.draft.length ?? 0, localChanged);
  const rejectedIds = useMemo(
    () =>
      new Set(
        (entry?.outcomes ?? [])
          .filter((o) => o.action === 'rejected' || o.action === 'skipped')
          .map((o) => o.studentId),
      ),
    [entry],
  );
  const conflictCount = entry?.conflicts.length ?? 0;

  const handleChange = (studentId: string, text: string) => {
    setValues((prev) => ({ ...prev, [studentId]: text }));
    dirtyRef.current.add(studentId);
    scheduleFlush();
  };

  const revert = (student: ClassSheetStudent) => {
    const overlaid = overlay[student.studentId];
    dirtyRef.current.delete(student.studentId);
    setValues((prev) => ({
      ...prev,
      [student.studentId]: String(
        overlaid ? overlaid.score : baselineScore(student, typeId as string),
      ),
    }));
  };

  const handleBlur = (student: ClassSheetStudent) => {
    const text = valuesRef.current[student.studentId] ?? '';
    if (text.trim() === '') revert(student);
    void flushDraft();
  };

  const handleKeyDown = (student: ClassSheetStudent, index: number, key: string) => {
    if (key !== 'Enter') return;
    const nextStudent = orderedStudents[index + 1];
    if (nextStudent) {
      inputRefs.current.get(nextStudent.studentId)?.focus();
    } else {
      inputRefs.current.get(student.studentId)?.blur();
    }
  };

  const handleSave = async () => {
    if (!ctx || !editable) return;
    await flushDraft();
    await saveMarks(ctx);
  };

  const stageHint = column ? `${column.name} · out of ${column.maxScore}` : 'Marks';

  return (
    <>
      <div className="fade-in space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="-ml-1" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex items-center gap-2">
            {conflictCount > 0 && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="rounded-full border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-1 text-xs font-semibold text-[var(--color-warning)]"
              >
                {conflictCount} conflict
              </button>
            )}
            {hasUnsynced && (
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
            {subject?.name ?? 'Marks'}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {sectionLabel} · {stageHint}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        )}

        {!isLoading && error && !data && (
          <Card
            className={cn(
              online
                ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                : 'border-dashed',
            )}
          >
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              {!online ? (
                <>
                  <CloudOff size={28} className="text-[var(--color-text-muted)]" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">You are offline</p>
                  <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
                    This stage has not been opened on this device yet, so it cannot be shown
                    offline.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-[var(--color-danger)]">
                    Could not load the marks
                  </p>
                  <p className="text-xs text-[var(--color-danger)] opacity-80">
                    {(error as Error)?.message ?? 'Please try again.'}
                  </p>
                  <Button variant="danger" size="sm" onClick={() => void refetch()}>
                    <RefreshCw size={14} /> Retry
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && data && !column && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
              This assessment type is not part of the subject setup.
            </CardContent>
          </Card>
        )}

        {!isLoading && data && column && (
          <>
            {(locked || notConducted) && (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
                {locked ? <Lock size={14} className="mt-0.5 shrink-0" /> : <CloudOff size={14} className="mt-0.5 shrink-0" />}
                <span>
                  {locked
                    ? 'This stage is locked. An administrator must reopen it before marks can change.'
                    : 'This stage has not been conducted yet, so marks cannot be entered.'}
                </span>
              </div>
            )}

            {(conflictCount > 0 || rejectedIds.size > 0) && (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                <div className="min-w-0 flex-1">
                  {conflictCount > 0 && (
                    <p>
                      {conflictCount} row{conflictCount === 1 ? '' : 's'} conflict with changes made
                      elsewhere. Review them under Saved on device.
                    </p>
                  )}
                  {rejectedIds.size > 0 && (
                    <p>
                      {rejectedIds.size} row{rejectedIds.size === 1 ? '' : 's'} could not be saved.
                      Fix the value and save again.
                    </p>
                  )}
                </div>
              </div>
            )}

            {orderedStudents.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                  No students are enrolled in this section.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {orderedStudents.map((student, index) => {
                  const cell = student.scores[typeId as string];
                  const value = values[student.studentId] ?? String(baselineScore(student, typeId as string));
                  const parsed = parseScore(value);
                  const empty = value.trim() === '';
                  const invalid = !empty && (parsed == null || parsed > maxScore);
                  const dirty = dirtyRef.current.has(student.studentId);
                  const unenteredZero = !dirty && !cell?.entered && value === '0';
                  const flagged = rejectedIds.has(student.studentId);
                  return (
                    <div
                      key={student.studentId}
                      className={cn(
                        'flex items-center gap-3 rounded-[var(--radius-lg)] border p-2.5',
                        flagged
                          ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {student.lastName}, {student.firstName}
                        </p>
                        {invalid && (
                          <p className="text-[11px] font-medium text-[var(--color-danger)]">
                            0 to {maxScore} with up to two decimals
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <input
                          ref={(node) => {
                            if (node) inputRefs.current.set(student.studentId, node);
                            else inputRefs.current.delete(student.studentId);
                          }}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          disabled={!editable}
                          value={value}
                          onChange={(e) => handleChange(student.studentId, e.target.value)}
                          onBlur={() => handleBlur(student)}
                          onKeyDown={(e) => handleKeyDown(student, index, e.key)}
                          aria-label={`Mark for ${student.firstName} ${student.lastName}`}
                          className={cn(
                            'h-11 w-20 rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-2 text-center text-sm font-semibold tabular-nums',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
                            'disabled:cursor-not-allowed disabled:opacity-70',
                            invalid
                              ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
                              : 'border-[var(--color-border)]',
                            unenteredZero
                              ? 'text-[var(--color-text-muted)]'
                              : 'text-[var(--color-text)]',
                          )}
                        />
                        <span className="text-xs text-[var(--color-text-muted)]">/ {maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!online && editable && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <CloudOff size={12} /> Saved marks will queue on this device and sync when online.
              </p>
            )}
          </>
        )}
      </div>

      {editable && orderedStudents.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-20 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-nav)] lg:bottom-0 lg:left-64 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
            <Badge variant="neutral" className="shrink-0 tabular-nums">
              {progress.entered}/{progress.total} entered
            </Badge>
            <Button
              className="flex-1"
              disabled={changedCount === 0}
              onClick={() => void handleSave()}
            >
              <Save size={16} />
              {changedCount > 0 ? `Save marks (${changedCount})` : 'Save marks'}
            </Button>
          </div>
        </div>
      )}

      <GradesQueuePanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
