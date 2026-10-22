import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Check, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  invalid?: boolean;
  emptyText?: string;
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  disabled = false,
  loading = false,
  allowClear = false,
  invalid = false,
  emptyText = 'No matches',
}: SearchableSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const closeTimer = useRef<number | null>(null);

  const selected = options.find((option) => option.value === value);

  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.hint ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [options, query]);

  const clampedIndex = Math.min(
    activeIndex,
    Math.max(0, visibleOptions.length - 1),
  );
  const activeOption = visibleOptions[clampedIndex];

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const openList = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
    setQuery('');
    setActiveIndex(0);
  };

  const closeList = () => {
    setOpen(false);
    setQuery('');
  };

  const selectOption = (option: SearchableSelectOption) => {
    onChange(option.value);
    closeList();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeList();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActiveIndex((current) =>
        Math.min(current + 1, Math.max(0, visibleOptions.length - 1)),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === 'Enter' && open && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
    }
  };

  return (
    <div>
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <Input
          id={id}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeOption ? `${listId}-${clampedIndex}` : undefined
          }
          autoComplete="off"
          disabled={disabled}
          error={invalid}
          value={open ? query : selected?.label ?? ''}
          placeholder={loading && options.length === 0 ? 'Loading...' : placeholder}
          onFocus={openList}
          onBlur={() => {
            closeTimer.current = window.setTimeout(() => closeList(), 120);
          }}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange('');
          }}
          className="pl-9 pr-9"
        />
        {allowClear && value && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange('');
              closeList();
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="mt-1 max-h-52 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-card)]"
        >
          {loading && visibleOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-[var(--color-text-muted)]">
              Loading...
            </p>
          ) : visibleOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-[var(--color-text-muted)]">
              {emptyText}
            </p>
          ) : (
            visibleOptions.map((option, index) => (
              <button
                key={option.value}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-left text-sm transition-colors',
                  index === clampedIndex
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{option.label}</span>
                  {option.hint && (
                    <span className="block truncate text-[11px] text-[var(--color-text-muted)]">
                      {option.hint}
                    </span>
                  )}
                </span>
                {option.value === value && (
                  <Check size={15} className="shrink-0 text-[var(--color-primary)]" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
