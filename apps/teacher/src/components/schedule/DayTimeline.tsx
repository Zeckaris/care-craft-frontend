/**
 * DayTimeline: one school day rendered as a vertical list of periods.
 *
 * Each row is a taught lesson, a free period, or a break. When viewing today
 * (and a timeline is available) the current row is accented with a "Now" badge
 * and the upcoming lesson carries a "Next" badge.
 */
import { BookOpen, Coffee } from 'lucide-react';
import { formatTime12Hour } from '@carecraft/utils';
import { Badge } from '@/components/ui/Badge';
import type { NowState, TimelineRow } from '@/lib/mySchedule';
import { gradeSectionLabel } from '@/lib/mySchedule';
import { cn } from '@/lib/utils';

interface DayTimelineProps {
  rows: TimelineRow[];
  live: boolean;
  nowState: NowState | null;
}

function timeRange(startTime: string, endTime: string): string {
  return `${formatTime12Hour(startTime)} to ${formatTime12Hour(endTime)}`;
}

export function DayTimeline({ rows, live, nowState }: DayTimelineProps) {
  return (
    <ul className="space-y-2" role="list">
      {rows.map((row, index) => {
        if (row.kind === 'break') {
          const isCurrent =
            live &&
            nowState?.kind === 'break' &&
            nowState.break?.afterPeriod === row.detail.afterPeriod &&
            nowState.break?.startTime === row.detail.startTime;

          return (
            <li
              key={`break-${row.detail.afterPeriod}-${row.detail.startTime}-${index}`}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2',
                isCurrent
                  ? 'border-[var(--color-warning)] bg-[var(--color-warning-light)]'
                  : 'border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)]',
              )}
            >
              <Coffee
                size={15}
                className={cn(
                  'shrink-0',
                  isCurrent
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-text-muted)]',
                )}
              />
              <span
                className={cn(
                  'text-xs font-semibold',
                  isCurrent
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-text-secondary)]',
                )}
              >
                {row.detail.label ?? 'Break'}
              </span>
              <span className="ml-auto text-[11px] text-[var(--color-text-muted)]">
                {timeRange(row.detail.startTime, row.detail.endTime)} ·{' '}
                {row.detail.durationMinutes} min
              </span>
              {isCurrent && <Badge variant="warning">Now</Badge>}
            </li>
          );
        }

        if (row.kind === 'free') {
          const isCurrent =
            live && nowState?.kind === 'free' && nowState.period === row.period;

          return (
            <li
              key={`free-${row.period}`}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3',
                isCurrent
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]',
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] text-xs font-bold text-[var(--color-text-muted)]">
                {row.period}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]',
                  )}
                >
                  Free period
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {timeRange(row.startTime, row.endTime)}
                </p>
              </div>
              {isCurrent && <Badge variant="primary">Now</Badge>}
            </li>
          );
        }

        const { block } = row;
        const isCurrent =
          live &&
          nowState?.kind === 'lesson' &&
          nowState.block?.entry.entryId === block.entry.entryId;
        const isNext =
          live &&
          !isCurrent &&
          nowState?.nextLesson?.entry.entryId === block.entry.entryId;

        return (
          <li
            key={block.entry.entryId}
            className={cn(
              'flex items-start gap-3 rounded-[var(--radius-lg)] border px-3 py-3 shadow-[var(--shadow-card)]',
              isCurrent
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]',
            )}
          >
            <span
              className={cn(
                'flex h-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] px-2 text-xs font-bold',
                isCurrent
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]',
              )}
            >
              {block.isDouble
                ? `P${block.startPeriod}-${block.endPeriod}`
                : `P${block.startPeriod}`}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--color-text)] leading-tight break-words">
                    {block.entry.subjectName}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 break-words">
                    {gradeSectionLabel(
                      block.entry.gradeLevel,
                      block.entry.sectionName,
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <BookOpen size={11} />
                    {timeRange(block.startTime, block.endTime)}
                  </p>
                </div>
                {isCurrent && <Badge variant="primary">Now</Badge>}
                {isNext && <Badge variant="info">Next</Badge>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
