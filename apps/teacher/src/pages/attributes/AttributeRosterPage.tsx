import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, RefreshCw, Search, ShieldX, Users } from 'lucide-react';
import type { ISectionRosterEnrollment } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { useBranding } from '@/context/BrandingContext';
import { useMySections } from '@/hooks/useMySections';
import { useSectionRoster } from '@/hooks/useSectionRoster';
import { useAttributeEvaluationIndex } from '@/hooks/useAttributeEvaluations';
import { formatSectionLabel } from '@/lib/section';
import { getApiErrorStatus } from '@/lib/api-error';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

function studentName(enrollment: ISectionRosterEnrollment): string {
  const student = enrollment.studentId;
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(' ');
}

function studentDisplayName(enrollment: ISectionRosterEnrollment): string {
  const student = enrollment.studentId;
  return [student.lastName, student.firstName].filter(Boolean).join(', ');
}

function initials(enrollment: ISectionRosterEnrollment): string {
  const student = enrollment.studentId;
  return `${student.firstName?.[0] ?? ''}${student.lastName?.[0] ?? ''}`.toUpperCase();
}

export default function AttributeRosterPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { refetch: refetchBranding } = useBranding();
  const { sections, isLoading: sectionsLoading, error: sectionsError, refetch: refetchSections } =
    useMySections();

  const sectionItem = sections.find((item) => item.section._id === sectionId);
  const canAccess = Boolean(sectionId && sectionItem?.isHomeroom);
  const sectionLabel = formatSectionLabel(sectionItem?.section);

  const {
    enrollments,
    total,
    isLoading: rosterLoading,
    isFetching: rosterFetching,
    error: rosterError,
    refetch: refetchRoster,
  } = useSectionRoster(canAccess ? sectionId : undefined);

  const {
    evaluations,
    isLoading: statusLoading,
    error: statusError,
  } = useAttributeEvaluationIndex(canAccess && enrollments.length > 0);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (statusError && getApiErrorStatus(statusError) === 403) {
      refetchBranding();
    }
  }, [statusError, refetchBranding]);

  const evaluatedEnrollmentIds = useMemo(
    () =>
      new Set(
        evaluations
          .map((evaluation) => evaluation.studentEnrollmentId?._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [evaluations],
  );

  const visibleEnrollments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return enrollments;
    return enrollments.filter((enrollment) =>
      studentName(enrollment).toLowerCase().includes(term),
    );
  }, [enrollments, search]);

  const back = () => navigate(-1);

  if (sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load your sections
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {sectionsError}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetchSections()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sectionItem || !sectionItem.isHomeroom) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ShieldX size={28} className="text-[var(--color-danger)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Not available</p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              Only the homeroom teacher for this section can record student attributes.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/app/attributes', { replace: true })}
            >
              Back to homeroom sections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        {rosterFetching && !rosterLoading && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <RefreshCw size={12} className="animate-spin" /> Refreshing…
          </span>
        )}
      </div>

      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {sectionLabel}
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Student attributes · {total} student{total !== 1 ? 's' : ''}
        </p>
      </div>

      {rosterError && (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load the roster
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {extractApiErrorMessage(rosterError)}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetchRoster()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {rosterLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!rosterLoading && !rosterError && enrollments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              No students enrolled
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              There are no active students in this section.
            </p>
          </CardContent>
        </Card>
      )}

      {!rosterLoading && !rosterError && enrollments.length > 0 && (
        <>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students"
              className="pl-9"
              aria-label="Search students"
            />
          </div>

          {statusError && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Evaluation status could not be loaded. You can still open a student to evaluate
              them.
            </p>
          )}

          {total > enrollments.length && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Showing the first {enrollments.length} students.
            </p>
          )}

          {visibleEnrollments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
                No students match “{search.trim()}”.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {visibleEnrollments.map((enrollment) => {
                const evaluated = evaluatedEnrollmentIds.has(enrollment._id);
                return (
                  <button
                    key={enrollment._id}
                    type="button"
                    onClick={() =>
                      navigate(`/app/attributes/${sectionId}/${enrollment.studentId._id}`)
                    }
                    className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-raised)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                      {initials(enrollment)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--color-text)]">
                        {studentDisplayName(enrollment)}
                      </span>
                    </span>
                    {!statusError &&
                      (statusLoading ? (
                        <Badge variant="neutral">Checking…</Badge>
                      ) : evaluated ? (
                        <Badge variant="success">Evaluated</Badge>
                      ) : (
                        <Badge variant="neutral">Pending</Badge>
                      ))}
                    <ChevronRight size={18} className="shrink-0 text-[var(--color-text-muted)]" />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
