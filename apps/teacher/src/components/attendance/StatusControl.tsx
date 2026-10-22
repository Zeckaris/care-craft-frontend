/**
 * StatusControl — fast, thumb-friendly per-student attendance control.
 *
 * Four tappable segments (Present / Absent / Late / Excused) with colour coding
 * drawn from the school palette.
 */
import { ATTENDANCE_STATUS_OPTIONS, type AttendanceStatusOption } from '@carecraft/attendance';
import type { AttendanceStatus } from '@carecraft/types';
import { ATTENDANCE_STATUS_STYLES, normalizeAttendanceStatus } from './status-styles';
import { cn } from '@/lib/utils';

interface StatusControlProps {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  ariaLabelPrefix?: string;
}

export function StatusControl({ value, onChange, disabled, ariaLabelPrefix }: StatusControlProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabelPrefix ? `${ariaLabelPrefix} status` : 'Attendance status'}
      className={cn(
        'inline-grid grid-cols-4 gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-0.5',
        // Dim only when there is nothing selected, so a locked-but-marked
        // student still shows their status at full contrast.
        disabled && value == null && 'opacity-60',
      )}
    >
      {ATTENDANCE_STATUS_OPTIONS.map((option: AttendanceStatusOption) => {
        const active = normalizeAttendanceStatus(value) === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-7 w-9 items-center justify-center rounded-[var(--radius-sm)] border text-[11px] font-bold transition-all',
              'active:scale-95 disabled:pointer-events-none',
              active
                ? ATTENDANCE_STATUS_STYLES[option.value]
                : 'border-transparent bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]',
            )}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
