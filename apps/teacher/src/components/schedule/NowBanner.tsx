/**
 * NowBanner: the live "what's happening now" summary for today's view.
 *
 * Shows the current lesson / break / free period (or the next event before the
 * day starts), what is coming up next, and how many lessons are scheduled.
 */
import { BookOpen, CalendarClock, CheckCircle2, Clock, Coffee } from 'lucide-react';
import { formatTime12Hour } from '@carecraft/utils';
import type { NowState } from '@/lib/mySchedule';
import { gradeSectionLabel } from '@/lib/mySchedule';
import { cn } from '@/lib/utils';

interface NowBannerProps {
  state: NowState | null;
  lessonCount: number;
}

export function NowBanner({ state, lessonCount }: NowBannerProps) {
  if (!state) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <CalendarClock size={18} />
          </div>
          <p className="flex-1 text-sm font-bold text-[var(--color-text)]">
            {lessonCount} lesson{lessonCount === 1 ? '' : 's'} today
          </p>
          <span className="shrink-0 rounded-[var(--radius-full)] bg-[var(--color-surface-raised)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            {lessonCount}
          </span>
        </div>
      </div>
    );
  }

  const { block, break: activeBreak } = state;

  let Icon = CalendarClock;
  let tone =
    'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]';
  let title = '';
  let subtitle = '';

  switch (state.kind) {
    case 'lesson':
      Icon = BookOpen;
      tone =
        'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]';
      title = block?.entry.subjectName ?? 'Lesson';
      subtitle = block
        ? `${gradeSectionLabel(block.entry.gradeLevel, block.entry.sectionName)} · ${formatTime12Hour(block.startTime)} to ${formatTime12Hour(block.endTime)}`
        : '';
      break;
    case 'break':
      Icon = Coffee;
      tone =
        'border-[var(--color-warning)] bg-[var(--color-warning-light)] text-[var(--color-warning)]';
      title = activeBreak?.label ?? 'Break';
      subtitle = activeBreak
        ? `until ${formatTime12Hour(activeBreak.endTime)}`
        : '';
      break;
    case 'free':
      Icon = Clock;
      tone =
        'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]';
      title = 'Free period';
      subtitle = 'No lesson scheduled in this period';
      break;
    case 'after':
      Icon = CheckCircle2;
      tone =
        'border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)]';
      title = 'School day finished';
      subtitle = 'Enjoy the rest of your day';
      break;
    case 'before':
    default:
      Icon = CalendarClock;
      title = state.firstStartTime
        ? `School starts at ${formatTime12Hour(state.firstStartTime)}`
        : 'No lessons today';
      subtitle = 'Your first lesson is coming up';
      break;
  }

  const next = state.nextLesson;

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border p-4 sm:p-5 shadow-[var(--shadow-card)]',
        tone,
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-white/60">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight truncate">{title}</p>
          {subtitle && <p className="text-xs mt-0.5 opacity-80 truncate">{subtitle}</p>}
        </div>
        <span className="shrink-0 rounded-[var(--radius-full)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold">
          {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-3 border-t border-[var(--color-border)] pt-3">
        <p className="text-xs">
          {next ? (
            <>
              <span className="font-semibold">Next: </span>
              {next.entry.subjectName} ·{' '}
              {gradeSectionLabel(next.entry.gradeLevel, next.entry.sectionName)} ·{' '}
              {formatTime12Hour(next.startTime)}
            </>
          ) : state.kind === 'after' ? (
            'No more lessons today.'
          ) : (
            'No lessons scheduled.'
          )}
        </p>
      </div>
    </div>
  );
}
