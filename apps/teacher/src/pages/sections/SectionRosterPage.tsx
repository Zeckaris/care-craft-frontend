import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquarePlus,
  RefreshCw,
  Search,
  ShieldX,
  Users,
} from 'lucide-react';
import type { ISectionRosterEnrollment } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { useBranding } from '@/context/BrandingContext';
import { useMySections } from '@/hooks/useMySections';
import { useSectionRoster } from '@/hooks/useSectionRoster';
import { formatSectionLabel } from '@/lib/section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

function studentName(enrollment: ISectionRosterEnrollment): string {
  const student = enrollment.studentId;
  return [student.firstName, student.lastName].filter(Boolean).join(' ');
}

function initials(enrollment: ISectionRosterEnrollment): string {
  const student = enrollment.studentId;
  return `${student.firstName?.[0] ?? ''}${student.lastName?.[0] ?? ''}`.toUpperCase();
}

function sortEnrollments(
  a: ISectionRosterEnrollment,
  b: ISectionRosterEnrollment,
): number {
  const byLast = a.studentId.lastName.localeCompare(b.studentId.lastName);
  if (byLast !== 0) return byLast;
  return a.studentId.firstName.localeCompare(b.studentId.firstName);
}

export default function SectionRosterPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { features, isLoaded: brandingLoaded } = useBranding();
  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useMySections();

  const sectionItem = sections.find((item) => item.section._id === sectionId);
  const sectionLabel = formatSectionLabel(sectionItem?.section);
  const canView = Boolean(sectionId && sectionItem);

  const {
    enrollments,
    total,
    isLoading: rosterLoading,
    isFetching,
    error: rosterError,
    refetch: refetchRoster,
  } = useSectionRoster(canView ? sectionId : undefined);

  const [search, setSearch] = useState('');

  const orderedEnrollments = useMemo(
    () => [...enrollments].sort(sortEnrollments),
    [enrollments],
  );

  const visibleEnrollments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return orderedEnrollments;
    return orderedEnrollments.filter((enrollment) =>
      studentName(enrollment).toLowerCase().includes(needle),
    );
  }, [orderedEnrollments, search]);

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

  if (!sectionItem) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ShieldX size={28} className="text-[var(--color-danger)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Section not available
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              This section is not one of your current sections.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/app/home', { replace: true })}
            >
              Back to home
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
        {isFetching && !rosterLoading && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <RefreshCw size={12} className="animate-spin" /> Refreshing...
          </span>
        )}
      </div>

      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {sectionLabel}
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Student roster · {total} student{total !== 1 ? 's' : ''}
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

          {total > enrollments.length && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Showing the first {enrollments.length} students.
            </p>
          )}

          {visibleEnrollments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
                No students match "{search.trim()}".
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {visibleEnrollments.map((enrollment, index) => {
                const showObservationAction =
                  brandingLoaded && features.observations;

                return (
                  <Card key={enrollment._id}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <span
                        className="w-5 shrink-0 text-center font-mono text-xs font-medium tabular-nums text-[var(--color-text-muted)] select-none"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                        {initials(enrollment)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {studentName(enrollment)}
                        </p>
                      </div>
                      {showObservationAction && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                          onClick={() =>
                            navigate(
                              `/app/observations?create=1&studentId=${enrollment.studentId._id}`,
                            )
                          }
                        >
                          <MessageSquarePlus size={15} />
                          <span className="hidden sm:inline">Add observation</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
