/**
 * StudentAttendanceRow — one roster row: student identity, status control and
 * an optional note. Locked (already-marked, older than the edit window) and
 * read-only rows render without interactive controls.
 */
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Lock, MessageSquare, User } from 'lucide-react';
import type { AttendanceRosterRow, AttendanceStatus } from '@carecraft/types';
import { formatStudentName } from '@carecraft/attendance';
import { ASSETS_BASE } from '@/services/api-client';
import { StatusControl } from '@/components/attendance/StatusControl';
import {
  ATTENDANCE_STATUS_STYLES,
  attendanceStatusLabel,
  normalizeAttendanceStatus,
} from '@/components/attendance/status-styles';
import { cn } from '@/lib/utils';

/**
 * Read-only readout of a recorded status. Shown on locked rows so the status is
 * unmistakable: a full contrast, colour-coded label (never the muted row grey),
 * with the word itself carrying the meaning as well as the colour.
 */
function StatusBadge({ status }: { status: AttendanceStatus }) {
  const canonical = normalizeAttendanceStatus(status);
  const label = attendanceStatusLabel(status);
  return (
    <span
      role="status"
      title={label}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        canonical
          ? ATTENDANCE_STATUS_STYLES[canonical]
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]',
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  );
}

function resolveImage(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSETS_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

interface StudentAttendanceRowProps {
  rowNumber: number;
  row: AttendanceRosterRow;
  status: AttendanceStatus | null;
  note: string;
  /** Already-saved record: shown muted and locked unless editing is enabled. */
  saved?: boolean;
  /** The day is in edit mode, which unlocks saved rows. */
  editable?: boolean;
  locked?: boolean;
  readOnly?: boolean;
  conflicted?: boolean;
  onChangeStatus: (status: AttendanceStatus) => void;
  onCommitNote: (note: string) => void;
}

export function StudentAttendanceRow({
  rowNumber,
  row,
  status,
  note,
  saved,
  editable,
  locked,
  readOnly,
  conflicted,
  onChangeStatus,
  onCommitNote,
}: StudentAttendanceRowProps) {
  const [expanded, setExpanded] = useState(Boolean(note));
  const [localNote, setLocalNote] = useState(note);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNote(note);
    if (note) setExpanded(true);
  }, [note, row.studentId]);

  const commit = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (value.trim() !== note.trim()) onCommitNote(value);
  };

  const handleNoteChange = (value: string) => {
    setLocalNote(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(value), 800);
  };

  const image = resolveImage(row.profileImage);
  const name = formatStudentName(row);
  // Saved rows stay locked until the teacher turns on editing for the day.
  const savedLocked = Boolean(saved) && !editable;
  const interactive = !readOnly && !locked && !conflicted && !savedLocked;
  const canEditNote = status != null && interactive;
  // Locked rows with a recorded value show a dedicated status readout instead
  // of the disabled four-way control, so the status is never ambiguous.
  const showStatusBadge = status != null && !interactive && !conflicted;

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border p-2.5 transition-colors',
        conflicted
          ? 'border-[var(--color-warning)] bg-[var(--color-warning-light)]'
          : 'border-[var(--color-border)]',
        // Muted for saved rows, but never washed out — the status chip keeps
        // its full colour so the teacher can still read it at a glance.
        !conflicted && (saved ? 'bg-[var(--color-surface-raised)]' : 'bg-[var(--color-surface)]'),
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-5 shrink-0 text-center font-mono text-xs font-medium tabular-nums text-[var(--color-text-muted)] select-none"
          aria-hidden="true"
        >
          {rowNumber}
        </span>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <User size={16} className="text-[var(--color-text-muted)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm font-semibold',
              saved ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]',
            )}
          >
            {name}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
            {locked && (
              <span className="inline-flex items-center gap-1">
                <Lock size={11} /> Locked
              </span>
            )}
            {conflicted && (
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-warning)]">
                <AlertTriangle size={11} /> Changed elsewhere
              </span>
            )}
            {row.status != null && !locked && !conflicted && (
              <span>Previously marked</span>
            )}
          </div>
        </div>

        {canEditNote && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Toggle note"
            aria-expanded={expanded}
            className={cn(
              'shrink-0 rounded-full p-2 transition-colors',
              note
                ? 'text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
            )}
          >
            <MessageSquare size={16} />
          </button>
        )}
      </div>

      <div className="mt-2">
        {showStatusBadge ? (
          <StatusBadge status={status} />
        ) : (
          <StatusControl
            value={status}
            onChange={onChangeStatus}
            disabled={!interactive}
            ariaLabelPrefix={name}
          />
        )}
      </div>

      {expanded && canEditNote && (
        <div className="mt-2">
          <input
            type="text"
            value={localNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit(localNote);
            }}
            placeholder="Add a note (optional)"
            maxLength={280}
            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      )}

      {note && (!expanded || !canEditNote) && (
        <p className="mt-2 truncate text-xs italic text-[var(--color-text-secondary)]">{note}</p>
      )}
    </div>
  );
}
