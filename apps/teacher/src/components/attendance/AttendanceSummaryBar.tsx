/**
 * AttendanceSummaryBar — running counts plus the mark-all-present shortcut.
 */
import { CheckCheck } from 'lucide-react';
import type { AttendanceCounts } from '@carecraft/attendance';
import { Button } from '@/components/ui/Button';

const CHIPS: Array<{ key: keyof AttendanceCounts; label: string; classes: string }> = [
  { key: 'present', label: 'Present', classes: 'bg-[var(--color-success-light)] text-[var(--color-success)]' },
  { key: 'absent', label: 'Absent', classes: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' },
  { key: 'late', label: 'Late', classes: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' },
  { key: 'excused', label: 'Excused', classes: 'bg-[var(--color-info-light)] text-[var(--color-info)]' },
  { key: 'unmarked', label: 'Unmarked', classes: 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]' },
];

interface AttendanceSummaryBarProps {
  counts: AttendanceCounts;
  onMarkAllPresent?: () => void;
  showMarkAll?: boolean;
}

export function AttendanceSummaryBar({ counts, onMarkAllPresent, showMarkAll }: AttendanceSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {CHIPS.map((chip) => (
          <span
            key={chip.key}
            className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold ${chip.classes}`}
          >
            <span className="tabular-nums">{counts[chip.key]}</span>
            <span className="font-medium opacity-80">{chip.label}</span>
          </span>
        ))}
      </div>

      {showMarkAll && onMarkAllPresent && (
        <Button
          id="attendance-mark-all-present"
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={onMarkAllPresent}
        >
          <CheckCheck size={15} />
          All present
        </Button>
      )}
    </div>
  );
}
