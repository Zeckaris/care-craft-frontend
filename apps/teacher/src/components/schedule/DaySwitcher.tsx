/**
 * DaySwitcher: horizontal day tabs for the teacher's timetable.
 *
 * Only the school's enabled days are shown (from the response's `days`), in
 * week order, labelled Mon…Sat.
 */
import { cn } from '@/lib/utils';
import { dayShortLabel, weekdayIndex } from '@/lib/mySchedule';

interface DaySwitcherProps {
  days: string[];
  selected: string;
  onSelect: (day: string) => void;
}

export function DaySwitcher({ days, selected, onSelect }: DaySwitcherProps) {
  const ordered = [...days].sort((a, b) => weekdayIndex(a) - weekdayIndex(b));

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      role="tablist"
      aria-label="School days"
    >
      {ordered.map((day) => {
        const active = day === selected;
        return (
          <button
            key={day}
            id={`schedule-day-${day}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(day)}
            className={cn(
              'shrink-0 rounded-[var(--radius-full)] px-4 py-2 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              active
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-[var(--shadow-card)]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]',
            )}
          >
            {dayShortLabel(day)}
          </button>
        );
      })}
    </div>
  );
}
