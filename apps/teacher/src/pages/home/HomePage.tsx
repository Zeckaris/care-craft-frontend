/**
 * HomePage — structured as the "Teacher's Day" overview.
 *
 * Highlights:
 *  • Day orientation: date, friendly greeting, and daily metrics overview
 *  • Section overview cards with prominent homeroom/subject badges
 *  • Dedicated "Take Attendance" entry action per section
 *  • Fully responsive grid: comfortable on phones, tablets, and wide monitors
 */
import { BookOpen, RefreshCw, Calendar, Users, Award, LayoutGrid } from 'lucide-react';
import { SectionCard } from '@/components/sections/SectionCard';
import { SectionCardSkeleton } from '@/components/sections/SectionCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useMySections } from '@/hooks/useMySections';
import { useUser } from '@/context/UserContext';

export default function HomePage() {
  const { user } = useUser();
  const { sections, isLoading, error, refetch } = useMySections();

  const firstName = user?.firstName ?? 'Teacher';

  // Calculate day summary metrics
  const totalStudents = sections.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const homeroomCount = sections.filter((s) => s.isHomeroom).length;
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
              Here is your teaching schedule and homeroom sections for today.
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
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shrink-0">
                <LayoutGrid size={18} />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-text)] leading-none">
                  {sections.length}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                  Assigned Sections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-x border-[var(--color-border)] px-3 sm:px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-homeroom-light)] text-[var(--color-homeroom)] shrink-0">
                <Award size={18} />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-text)] leading-none">
                  {homeroomCount}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                  Homeroom {homeroomCount === 1 ? 'Role' : 'Roles'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-1 sm:pl-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-success-light)] text-[var(--color-success)] shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-text)] leading-none">
                  {totalStudents}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                  Total Students
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sections Schedule & Overview ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">
              Today's Sections
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
              <SectionCard key={item.section._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
