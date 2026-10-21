import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@carecraft/query-core';
import type { IObservation } from '@carecraft/types';
import { useCurrentTerm, useTerms } from '@/hooks/grades';
import { useMySections } from '@/hooks/useMySections';
import {
  useObservationStudents,
  type ObservationStudent,
} from '@/hooks/useObservationStudents';
import {
  useObservationMutations,
  useObservations,
} from '@/hooks/useObservations';
import { uniqueSubjects } from '@/lib/observationSubjects';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ObservationFormModal } from '@/components/observations/ObservationFormModal';
import { SearchableSelect } from '@/components/observations/SearchableSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_SIZE = 10;

type FormState =
  | { mode: 'create'; studentId?: string }
  | { mode: 'edit'; observation: IObservation };

function sortStudents(a: ObservationStudent, b: ObservationStudent): number {
  const byLast = a.lastName.localeCompare(b.lastName);
  if (byLast !== 0) return byLast;
  return a.firstName.localeCompare(b.firstName);
}

function observationDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    },
  );
}

export default function ObservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const online = useOnlineStatus();

  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [term, setTerm] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IObservation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentTermQuery = useCurrentTerm();
  const termsQuery = useTerms();
  const currentTerm = currentTermQuery.data ?? null;
  const terms = useMemo(() => termsQuery.data ?? [], [termsQuery.data]);

  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useMySections();

  const sectionIds = useMemo(
    () => sections.map((item) => item.section._id),
    [sections],
  );

  const subjectOptions = useMemo(
    () =>
      uniqueSubjects(sections).map((subject) => ({
        value: subject._id,
        label: subject.name,
      })),
    [sections],
  );

  const {
    students: rosterStudents,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useObservationStudents(sectionIds, sectionIds.length > 0);

  const {
    observations,
    total,
    currentPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useObservations({
    page,
    limit: PAGE_SIZE,
    studentId: studentId || undefined,
    subjectId: subjectId || undefined,
    term: term || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const { deleteObservation, isDeleting } = useObservationMutations();

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    const requestedStudent = searchParams.get('studentId') ?? undefined;
    setFormState({ mode: 'create', studentId: requestedStudent });
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const allStudents = useMemo(() => {
    const byId = new Map<string, ObservationStudent>();
    for (const student of rosterStudents) {
      byId.set(student._id, student);
    }
    for (const observation of observations) {
      const student = observation.studentId;
      if (!student || byId.has(student._id)) continue;
      byId.set(student._id, {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        sectionIds: [],
      });
    }
    return Array.from(byId.values()).sort(sortStudents);
  }, [observations, rosterStudents]);

  const studentOptions = useMemo(
    () => allStudents.map((student) => ({ value: student._id, label: `${student.firstName} ${student.lastName}` })),
    [allStudents],
  );

  const termOptions = useMemo(
    () =>
      [...terms]
        .sort((a, b) => {
          const byYear = b.calendarId.academicYear.localeCompare(
            a.calendarId.academicYear,
          );
          if (byYear !== 0) return byYear;
          return (a.sequence ?? 0) - (b.sequence ?? 0);
        })
        .map((item) => ({
          value: item._id,
          label: item.name,
          hint: item.calendarId.academicYear,
        })),
    [terms],
  );

  const termNameById = useMemo(
    () => new Map(terms.map((item) => [item._id, item.name])),
    [terms],
  );

  const hasFilters = Boolean(studentId || subjectId || term || from || to);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const canCreate = Boolean(
    online &&
      currentTerm &&
      !currentTermQuery.isLoading &&
      !sectionsLoading &&
      sections.length > 0,
  );

  useEffect(() => {
    if (!isLoading && total > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, total, totalPages]);

  const resetFilters = () => {
    setStudentId('');
    setSubjectId('');
    setTerm('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (!online) {
      setActionError(
        'You are offline. Connect to the internet to delete this observation.',
      );
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteObservation(deleteTarget._id);
      toast.success('Observation deleted.');
      setDeleteTarget(null);
      setActionError(null);
      if (observations.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (error) {
      const message = extractApiErrorMessage(error);
      setActionError(
        /network error/i.test(message)
          ? 'Could not reach the server. Connect to the internet and try again.'
          : message || 'Could not delete the observation. Please try again.',
      );
      setDeleteTarget(null);
    }
  };

  const deleteStudentName = deleteTarget?.studentId
    ? `${deleteTarget.studentId.firstName} ${deleteTarget.studentId.lastName}`
    : 'this student';

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
            Observations
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Notes shared with parents about students in your sections.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={!canCreate}
          onClick={() => setFormState({ mode: 'create' })}
        >
          <Plus size={15} />
          New
        </Button>
      </div>

      {!online && (
        <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
          <WifiOff size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
          <span>
            You are offline. Observations already on this device can still be
            viewed, but new observations and changes cannot be saved until you
            reconnect.
          </span>
        </div>
      )}

      {!currentTermQuery.isLoading && !currentTerm && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
          <p className="font-semibold">No current academic term</p>
          <p className="mt-0.5">
            New observations cannot be added right now. Existing observations
            are still available below.
          </p>
          {currentTermQuery.isError && (
            <button
              type="button"
              className="mt-1 font-bold underline"
              onClick={() => void currentTermQuery.refetch()}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-3 py-2.5 text-xs text-[var(--color-danger)]"
        >
          <span>{actionError}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            className="shrink-0"
            onClick={() => setActionError(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {(sectionsError || studentsError) && (
        <div className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
          <span>
            Some students could not be loaded. You can still view observations,
            but creating one may be unavailable.
          </span>
          <button
            type="button"
            className="shrink-0 font-bold underline"
            onClick={() => {
              if (sectionsError) void refetchSections();
              if (studentsError) void refetchStudents();
            }}
          >
            Retry
          </button>
        </div>
      )}

      <Card>
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <SearchableSelect
              value={studentId}
              onChange={(value) => {
                setStudentId(value);
                setPage(1);
              }}
              options={studentOptions}
              placeholder="All students"
              ariaLabel="Filter by student"
              allowClear
            />
            <SearchableSelect
              value={subjectId}
              onChange={(value) => {
                setSubjectId(value);
                setPage(1);
              }}
              options={subjectOptions}
              placeholder="All subjects"
              ariaLabel="Filter by subject"
              allowClear
            />
            <SearchableSelect
              value={term}
              onChange={(value) => {
                setTerm(value);
                setPage(1);
              }}
              options={termOptions}
              placeholder="All terms"
              ariaLabel="Filter by term"
              allowClear
              loading={termsQuery.isLoading}
            />
            <div>
              <Input
                type="date"
                value={from}
                max={to || undefined}
                aria-label="Filter from date"
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">From date</p>
            </div>
            <div>
              <Input
                type="date"
                value={to}
                min={from || undefined}
                aria-label="Filter to date"
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">To date</p>
            </div>
          </div>
          {hasFilters && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && observations.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && isError && observations.length === 0 && (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load your observations
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {extractApiErrorMessage(error)}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && observations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {hasFilters ? 'No observations match these filters' : 'No observations yet'}
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              {hasFilters
                ? 'Try clearing a filter or choosing another date range.'
                : 'Share a quick note about a student in one of your sections.'}
            </p>
          </CardContent>
        </Card>
      )}

      {observations.length > 0 && (
        <div className="space-y-2">
          {isFetching && !isLoading && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <RefreshCw size={12} className="animate-spin" /> Refreshing observations...
            </p>
          )}

          {isError && (
            <p className="text-xs text-[var(--color-danger)]">
              Could not refresh observations: {extractApiErrorMessage(error)}
            </p>
          )}

          {observations.map((observation, index) => {
            const student = observation.studentId;
            const studentName = student
              ? `${student.firstName} ${student.lastName}`
              : 'Deleted student';
            const subjectName = observation.subjectId?.name ?? 'No subject';
            const termName = termNameById.get(observation.term);
            const rowNumber = (page - 1) * PAGE_SIZE + index + 1;

            return (
              <Card key={observation._id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <span
                      className="w-5 shrink-0 pt-0.5 text-center font-mono text-xs font-medium tabular-nums text-[var(--color-text-muted)] select-none"
                      aria-hidden="true"
                    >
                      {rowNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--color-text)]">
                            {studentName}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Badge variant="neutral">{subjectName}</Badge>
                            <span>{observationDate(observation.date)}</span>
                            {termName ? <span>{` · ${termName}`}</span> : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Edit observation"
                            onClick={() =>
                              setFormState({ mode: 'edit', observation })
                            }
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-[var(--color-danger)]"
                            aria-label="Delete observation"
                            onClick={() => setDeleteTarget(observation)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--color-text)]">
                        {observation.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-[var(--color-text-muted)]">
                Showing {rangeStart} to {rangeEnd} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {formState && (
        <ObservationFormModal
          key={
            formState.mode === 'edit'
              ? `edit-${formState.observation._id}`
              : `create-${formState.studentId ?? 'any'}`
          }
          mode={formState.mode}
          observation={
            formState.mode === 'edit' ? formState.observation : undefined
          }
          preselectedStudentId={
            formState.mode === 'create' ? formState.studentId : undefined
          }
          students={rosterStudents}
          studentsLoading={studentsLoading}
          sections={sections}
          currentTerm={currentTerm}
          termLoading={currentTermQuery.isLoading}
          online={online}
          onClose={() => setFormState(null)}
          onSaved={() => setFormState(null)}
        />
      )}

      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
        title="Delete observation"
        description="The parent will no longer see this note."
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text)]">
            Delete the observation for {deleteStudentName}? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              loading={isDeleting}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
