/**
 * TermPicker — choose the academic term for a class sheet.
 *
 * Only terms whose calendar year matches the section's school year are listed;
 * a term from another year is rejected by the API with a 409.
 */
import type { AcademicTerm } from '@carecraft/types';
import { cn } from '@/lib/utils';

interface TermPickerProps {
  terms: AcademicTerm[];
  value?: string;
  currentTermId?: string | null;
  onChange: (termId: string) => void;
  disabled?: boolean;
}

export function TermPicker({ terms, value, currentTermId, onChange, disabled }: TermPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="grades-term"
        className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
      >
        Term
      </label>
      <select
        id="grades-term"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)]',
          'bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]',
          'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <option value="" disabled>
          Select a term
        </option>
        {terms.map((term) => (
          <option key={term._id} value={term._id}>
            {term.name}
            {term._id === currentTermId ? ' (current)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
