/**
 * ClassSheetPage — the class sheet for one section + subject + term.
 *
 * Shows the assessment-type columns, totals and averages, plus the stage
 * actions (conduct, enter marks, complete and lock). Conduct and complete are
 * online-only; marks entry works offline through the shared queue.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import type { ClassSheetColumn } from '@carecraft/types';
import { GradesRequestError, nextConductableColumn } from '@carecraft/grades';
import { useMySections } from '@/hooks/useMySections';
import { useClassSheet } from '@/hooks/grades';
import { useGradeTerm } from '@/hooks/useGradeTerm';
import { gradesApi } from '@/services/grades-api';
import { useGradesQueue } from '@/context/GradesQueueContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatSectionLabel } from '@/lib/section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { TermPicker } from '@/components/grades/TermPicker';
import { StageChips } from '@/components/grades/StageChips';
import { ClassSheetTable } from '@/components/grades/ClassSheetTable';
import { GradesQueuePanel } from '@/components/grades/GradesQueuePanel';

function errorMessage(error: unknown): string {
  return (error as Error)?.message ?? 'Something went wrong. Please try again.';
}

export default function ClassSheetPage() {
  const { sectionId, subjectId } = useParams<{ sectionId: string; subjectId: string }>();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const { sections } = useMySections();
  const sectionItem = sections.find((s) => s.section._id === sectionId);
  const subject = sectionItem?.subjects.find((s) => s._id === subjectId);
  const sectionLabel = formatSectionLabel(sectionItem?.section);
  const schoolYear = sectionItem?.section.schoolYear;

  const { termId, setTermId, terms, currentTermId, isLoadingTerms, refetchTerms } =
    useGradeTerm(schoolYear);

  const { data, dataUpdatedAt, isLoading, isFetching, error, refetch } = useClassSheet(
    sectionId,
    subjectId,
    termId,
  );
  const { entries, hasUnsynced, reconcileWithSheet, flagAuthRequired } = useGradesQueue();

  const [busyTypeId, setBusyTypeId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmColumn, setConfirmColumn] = useState<ClassSheetColumn | null>(null);

  // Reconcile any accepted-but-unconfirmed marks against the freshly fetched sheet.
  useEffect(() => {
    if (!sectionId || !subjectId || !termId || !data?.students) return;
    for (const entry of entries) {
      if (
        entry.sectionId === sectionId &&
        entry.subjectId === subjectId &&
        entry.academicTermId === termId
      ) {
        void reconcileWithSheet(
          {
            sectionId,
            subjectId,
            academicTermId: termId,
            assessmentTypeId: entry.assessmentTypeId,
          },
          data.students,
          dataUpdatedAt,
        );
      }
    }
  }, [sectionId, subjectId, termId, data, dataUpdatedAt, entries, reconcileWithSheet]);

  // A 401 while fetching pauses syncing and shows the sign-in banner.
  useEffect(() => {
    if (error instanceof GradesRequestError && error.kind === 'auth') flagAuthRequired();
  }, [error, flagAuthRequired]);

  const orderedColumns = useMemo(() => data?.columns ?? [], [data]);
  const nextStage = useMemo(() => nextConductableColumn(orderedColumns), [orderedColumns]);

  const runStageAction = async (
    column: ClassSheetColumn,
    action: 'conduct' | 'complete',
  ) => {
    if (!sectionId || !subjectId || !termId) return;
    setBusyTypeId(column.typeId);
    try {
      const input = {
        sectionId,
        subjectId,
        academicTermId: termId,
        assessmentTypeId: column.typeId,
      };
      if (action === 'conduct') {
        await gradesApi.conductStage(input);
        toast.success(`${column.name} conducted`);
      } else {
        await gradesApi.completeStage(input);
        toast.success(`${column.name} completed and locked`);
      }
      await refetch();
    } catch (actionError) {
      toast.error(errorMessage(actionError));
    } finally {
      setBusyTypeId(null);
    }
  };

  const openMarks = (column: ClassSheetColumn) => {
    if (!sectionId || !subjectId) return;
    const query = termId ? `?term=${termId}` : '';
    navigate(`/app/sections/${sectionId}/grades/${subjectId}/marks/${column.typeId}${query}`);
  };

  const needsTermPick = !termId && !isLoadingTerms;

  return (
    <>
      <div className="fade-in space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="-ml-1" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </Button>
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

        <div>
          <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
            {subject?.name ?? 'Class sheet'}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {sectionLabel}
            {schoolYear ? ` · ${schoolYear}` : ''}
          </p>
        </div>

        {isLoadingTerms ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : needsTermPick ? (
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {terms.length === 0 ? 'No terms available' : 'Select a term'}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {terms.length === 0
                  ? 'There are no terms for this section’s school year yet.'
                  : 'There is no current term. Choose one to open the class sheet.'}
              </p>
              {terms.length === 0 ? (
                <Button variant="secondary" size="sm" onClick={refetchTerms}>
                  <RefreshCw size={14} /> Retry
                </Button>
              ) : (
                <TermPicker
                  terms={terms}
                  value={termId}
                  currentTermId={currentTermId}
                  onChange={setTermId}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[200px] flex-1">
                <TermPicker
                  terms={terms}
                  value={termId}
                  currentTermId={currentTermId}
                  onChange={setTermId}
                />
              </div>
              {!online && data && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                  <WifiOff size={12} /> Showing saved copy
                </span>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            )}

            {!isLoading && error && !data && (
              <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
                <CardContent className="p-6 text-center">
                  <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
                    Could not load the class sheet
                  </p>
                  <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
                    {errorMessage(error)}
                  </p>
                  <Button variant="danger" size="sm" onClick={() => void refetch()}>
                    <RefreshCw size={14} /> Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {data && (
              <>
                {isFetching && (
                  <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <RefreshCw size={12} className="animate-spin" /> Refreshing…
                  </p>
                )}

                {!online && (
                  <p className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <CloudOff size={12} className="mt-0.5 shrink-0" />
                    You are offline. Conducting and completing stages needs a connection; saving
                    marks works on this device.
                  </p>
                )}

                {orderedColumns.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                      No assessment setup is configured for this subject and grade.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <StageChips
                      columns={orderedColumns}
                      online={online}
                      busyTypeId={busyTypeId}
                      onConduct={(column) => void runStageAction(column, 'conduct')}
                      onComplete={(column) => setConfirmColumn(column)}
                      onEnterMarks={openMarks}
                    />

                    {!data.hasConductedStages && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        No stage has been conducted yet. Conduct{' '}
                        {nextStage?.name ?? 'the first stage'} to start entering marks.
                      </p>
                    )}

                    {data.students.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                          No students are enrolled in this section.
                        </CardContent>
                      </Card>
                    ) : (
                      <ClassSheetTable
                        columns={orderedColumns}
                        students={data.students}
                        onSelectStudent={() => {
                          const stage = orderedColumns.find((c) => c.state === 'conducted');
                          if (stage) openMarks(stage);
                        }}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Modal
        open={confirmColumn != null}
        onOpenChange={(open) => {
          if (!open) setConfirmColumn(null);
        }}
        title={confirmColumn ? `Complete and lock ${confirmColumn.name}?` : 'Complete and lock'}
        description="After completing, the marks for this stage can no longer be changed by the teacher. An administrator must reopen it to make changes."
      >
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={() => setConfirmColumn(null)}>
            Cancel
          </Button>
          <Button
            variant="default"
            loading={busyTypeId != null}
            onClick={() => {
              if (confirmColumn) void runStageAction(confirmColumn, 'complete');
              setConfirmColumn(null);
            }}
          >
            Complete and lock
          </Button>
        </div>
      </Modal>

      <GradesQueuePanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
