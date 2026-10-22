/**
 * MySchedulePage: the teacher's own published timetable.
 *
 * Opens on today (device clock) when school is in session, otherwise the next
 * enabled school day, and renders each day from its own bell-schedule timeline.
 * The current period/break is highlighted when viewing today, and the view is
 * backed by the persisted query cache so it stays readable offline.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CalendarDays,
  CalendarOff,
  CalendarX,
  RefreshCw,
} from 'lucide-react';
import { formatTime12Hour } from '@carecraft/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DaySwitcher } from '@/components/schedule/DaySwitcher';
import { DayTimeline } from '@/components/schedule/DayTimeline';
import { NowBanner } from '@/components/schedule/NowBanner';
import { useMySchedule } from '@/hooks/useMySchedule';
import { useNowMinutes } from '@/hooks/useNowMinutes';
import {
  buildDayBlocks,
  buildTimelineRows,
  computeNowState,
  defaultDaySelection,
  todayName,
} from '@/lib/mySchedule';

function formatPublishedAt(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StateMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default function MySchedulePage() {
  const { data, status, errorMessage, refetch, isFetching, schoolYear } =
    useMySchedule();
  const nowMin = useNowMinutes();
  const today = todayName();

  const [preferred, setPreferred] = useState<{ day: string; note: string | null }>({
    day: '',
    note: null,
  });
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    if (!data) return;
    const next = defaultDaySelection(data.days, today);
    setPreferred(next);
    setSelectedDay((prev) => (prev && data.days.includes(prev) ? prev : next.day));
  }, [data, today]);

  const days = data?.days ?? [];
  const timelineDays = data?.timeline?.days ?? [];
  const fallback = timelineDays.length === 0;
  const entries = useMemo(() => data?.entries ?? [], [data]);

  const selectedTimelineDay =
    timelineDays.find((d) => d.day === selectedDay) ?? null;
  const selectedEntries = entries.filter((e) => e.day === selectedDay);
  const todayEntries = useMemo(
    () => entries.filter((e) => e.day === today),
    [entries, today],
  );
  const todayLessonCount = buildDayBlocks(todayEntries).count;

  const rows = data
    ? buildTimelineRows(selectedTimelineDay, selectedEntries, fallback)
    : [];

  const isToday = selectedDay === today;
  const nowState =
    isToday && selectedTimelineDay
      ? computeNowState(selectedTimelineDay, todayEntries, nowMin)
      : null;

  const dayNote = selectedDay === preferred.day ? preferred.note : null;

  return (
    <div className="space-y-5 fade-in">
      {/* ── Header ── */}
      <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-1">
              <CalendarDays size={14} />
              <span>My Timetable</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
              My Schedule
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
              {schoolYear ? (
                <>
                  {schoolYear}
                  {data?.publishedAt
                    ? ` · updated ${formatPublishedAt(data.publishedAt)}`
                    : ''}
                </>
              ) : (
                'Your published teaching timetable'
              )}
            </p>
          </div>

          <Button
            id="schedule-refresh"
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="self-start sm:self-auto shrink-0"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : undefined} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading schedule">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-9 w-16 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-[var(--radius-lg)]" />
          ))}
        </div>
      )}

      {/* ── No sections / no lessons assigned ── */}
      {status === 'no-sections' && (
        <StateMessage
          icon={<BookOpen size={28} className="text-[var(--color-primary)]" />}
          title="No lessons assigned yet"
          body="No lessons are assigned to you yet. Once you're assigned to sections, your timetable will appear here."
        />
      )}

      {/* ── Nothing published ── */}
      {status === 'not-published' && (
        <StateMessage
          icon={<CalendarOff size={28} className="text-[var(--color-primary)]" />}
          title="Schedule not published"
          body="Your schedule hasn't been published yet. Please check back later."
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw size={13} />
              Check again
            </Button>
          }
        />
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)] text-center p-6">
          <CardContent className="pt-2">
            <p className="text-sm text-[var(--color-danger)] font-bold mb-1">
              Could not load your schedule
            </p>
            <p className="text-xs text-[var(--color-danger)] mb-4 opacity-80">
              {errorMessage}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw size={14} />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Ready ── */}
      {status === 'ready' && data && (
        <div className="space-y-4">
          <DaySwitcher days={days} selected={selectedDay} onSelect={setSelectedDay} />

          {dayNote && (
            <p className="text-xs text-[var(--color-text-muted)] -mt-1">{dayNote}</p>
          )}

          {isToday && (
            <NowBanner state={nowState} lessonCount={todayLessonCount} />
          )}

          {data.count === 0 && (
            <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3">
              <CalendarX
                size={16}
                className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
              />
              <p className="text-xs text-[var(--color-text-secondary)]">
                No lessons are assigned to you in this timetable.
              </p>
            </div>
          )}

          {rows.length > 0 ? (
            <DayTimeline rows={rows} live={isToday && !fallback} nowState={nowState} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {isToday
                  ? `No lessons scheduled for today${selectedTimelineDay?.startTime ? ` (school runs ${formatTime12Hour(selectedTimelineDay.startTime)} to ${formatTime12Hour(selectedTimelineDay.endTime)})` : ''}.`
                  : 'No lessons scheduled for this day.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
