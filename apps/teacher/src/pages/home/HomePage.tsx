/**
 * HomePage: the teacher's classes overview.
 *
 * Highlights:
 *  • Date and friendly greeting with a summary of assigned classes
 *  • Section overview cards with prominent homeroom/subject badges
 *  • Dedicated "Take Attendance" entry action per section
 *  • Fully responsive grid: comfortable on phones, tablets, and wide monitors
 */
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  RefreshCw,
  Calendar,
  Users,
  Award,
  LayoutGrid,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SectionCard } from '@/components/sections/SectionCard';
import { SectionCardSkeleton } from '@/components/sections/SectionCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useMySections } from '@/hooks/useMySections';
import { usePrefetchHomeroomRosters } from '@/hooks/useAttendanceRoster';
import { useAttendanceQueue } from '@/context/AttendanceQueueContext';
import { useBranding } from '@/context/BrandingContext';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

/** A single cell in the classes summary strip (icon, number, label). */
function SummaryStat({
  icon,
  value,
  label,
  iconClass,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  iconClass: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div
        className={cn(
          'mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] sm:h-10 sm:w-10',
          iconClass,
        )}
      >
        {icon}
      </div>
      <p className="text-base font-bold leading-none text-[var(--color-text)] sm:text-xl">
        {value}
      </p>
      <p className="mt-0.5 max-w-full break-words text-[10px] font-medium leading-tight text-[var(--color-text-muted)] sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { features, isLoaded: brandingLoaded } = useBranding();
  const { sections, isLoading, error, refetch } = useMySections();
  const { entries } = useAttendanceQueue();

  // Keep today's homeroom rosters available offline.
  usePrefetchHomeroomRosters(sections);

  const pendingSectionIds = new Set(
    entries
      .filter(
        (e) =>
          e.pending.length > 0 ||
          e.conflicts.length > 0 ||
          e.outcomes.some((o) => o.action === 'rejected'),
      )
      .map((e) => e.sectionId),
  );

  const firstName = user?.firstName ?? 'Teacher';

  // Calculate day summary metrics
  const totalStudents = sections.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const homeroomCount = sections.filter((s) => s.isHomeroom).length;
  const showAttributeCard =
    brandingLoaded && features.attributeEvaluation && homeroomCount > 0;
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fade-in space-y-6">
      {/* ── Day Header & Welcome Banner ── */}
      <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-1">
              <Calendar size={14} />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
              Good day, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Here are your classes and homeroom sections.
            </p>
          </div>

          {!isLoading && (
            <Button
              id="home-refresh-top"
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              className="self-start sm:self-auto shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Sync Sections</span>
            </Button>
          )}
        </div>

        {/* Quick summary stats strip */}
        {!isLoading && !error && sections.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-[var(--color-border)] sm:gap-3">
            <SummaryStat
              icon={<LayoutGrid size={18} />}
              value={sections.length}
              label="Assigned Sections"
              iconClass="bg-[var(--color-primary-light)] text-[var(--color-primary)]"
            />
            <SummaryStat
              icon={<Award size={18} />}
              value={homeroomCount}
              label={homeroomCount === 1 ? 'Homeroom Role' : 'Homeroom Roles'}
              iconClass="bg-[var(--color-homeroom-light)] text-[var(--color-homeroom)]"
            />
            <SummaryStat
              icon={<Users size={18} />}
              value={totalStudents}
              label="Total Students"
              iconClass="bg-[var(--color-success-light)] text-[var(--color-success)]"
            />
          </div>
        )}
      </div>

      {showAttributeCard && (
        <button
          type="button"
          onClick={() => navigate('/app/attributes')}
          className="group flex w-full items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md sm:p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)] sm:text-lg">
              Student attributes
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] sm:text-sm">
              Record attribute evaluations for your homeroom students.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
            Open
            <ChevronRight size={16} />
          </span>
        </button>
      )}

      {/* ── Classes overview ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">
              Your classes
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Select a section to manage records or jump straight into attendance.
            </p>
          </div>

          {!isLoading && (
            <button
              id="home-refresh"
              onClick={() => void refetch()}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] p-1.5 rounded-full hover:bg-[var(--color-surface-raised)] transition-colors"
              aria-label="Refresh sections"
              title="Refresh sections"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
            aria-busy="true"
            aria-label="Loading sections"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <SectionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)] text-center p-6">
            <CardContent className="pt-2">
              <p className="text-sm text-[var(--color-danger)] font-bold mb-1">
                Could not load your sections
              </p>
              <p className="text-xs text-[var(--color-danger)] mb-4 opacity-80">
                {error}
              </p>
              <Button
                id="home-retry"
                variant="danger"
                size="sm"
                onClick={() => void refetch()}
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] mb-4">
              <BookOpen size={28} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)] mb-1">
              No sections assigned
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              You haven't been assigned to any sections for the current school year. Please contact your school administrator.
            </p>
          </div>
        )}

        {/* Responsive Grid of Section Cards */}
        {!isLoading && !error && sections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {sections.map((item) => (
              <SectionCard
                key={item.section._id}
                item={item}
                pendingSync={pendingSectionIds.has(item.section._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
