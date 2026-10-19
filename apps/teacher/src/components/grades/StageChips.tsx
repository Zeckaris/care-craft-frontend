/**
 * StageChips — compact stage list shown above the class sheet.
 *
 * Only the next not-conducted stage (in column order) can be conducted; later
 * stages are disabled with a hint naming the stage to conduct first. Conducted
 * stages offer Enter marks and Complete and lock. Locked stages are read-only
 * and tell the teacher an administrator must reopen them.
 */
import { CheckCircle2, Lock, Pencil, Play, RotateCcw } from 'lucide-react';
import type { ClassSheetColumn } from '@carecraft/types';
import { nextConductableColumn, orderColumns, stageStateLabel } from '@carecraft/grades';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface StageChipsProps {
  columns: ClassSheetColumn[];
  online: boolean;
  busyTypeId: string | null;
  onConduct: (column: ClassSheetColumn) => void;
  onComplete: (column: ClassSheetColumn) => void;
  onEnterMarks: (column: ClassSheetColumn) => void;
}

function stateBadgeVariant(state: ClassSheetColumn['state']) {
  if (state === 'locked') return 'neutral' as const;
  if (state === 'conducted') return 'success' as const;
  return 'warning' as const;
}

export function StageChips({
  columns,
  online,
  busyTypeId,
  onConduct,
  onComplete,
  onEnterMarks,
}: StageChipsProps) {
  const ordered = orderColumns(columns);
  const next = nextConductableColumn(columns);

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {ordered.map((column) => {
        const isNext = next?.typeId === column.typeId;
        const busy = busyTypeId === column.typeId;
        return (
          <div
            key={column.typeId}
            className={cn(
              'flex w-56 shrink-0 flex-col gap-2 rounded-[var(--radius-lg)] border p-3',
              column.state === 'locked'
                ? 'border-[var(--color-border)] bg-[var(--color-surface-raised)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">{column.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  out of {column.maxScore} · weight {column.weight}
                </p>
              </div>
              <Badge variant={stateBadgeVariant(column.state)} className="shrink-0">
                {stageStateLabel(column.state)}
              </Badge>
            </div>

            {column.state === 'locked' && (
              <p className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
                <Lock size={12} /> Ask an administrator to reopen it to change marks.
              </p>
            )}

            {column.state === 'conducted' && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEnterMarks(column)}
                >
                  <Pencil size={13} /> Enter marks
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  loading={busy}
                  disabled={!online}
                  title={!online ? 'Connect to complete this stage' : undefined}
                  onClick={() => onComplete(column)}
                >
                  <CheckCircle2 size={13} /> Complete
                </Button>
              </div>
            )}

            {column.state === 'not-conducted' && (
              <div className="flex flex-col gap-1">
                <Button
                  variant="default"
                  size="sm"
                  loading={busy}
                  disabled={!online || !isNext}
                  onClick={() => onConduct(column)}
                >
                  {isNext ? <Play size={13} /> : <RotateCcw size={13} />}
                  Conduct
                </Button>
                {!online && (
                  <p className="text-[11px] text-[var(--color-warning)]">
                    Connect to conduct a stage.
                  </p>
                )}
                {online && !isNext && next && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Conduct {next.name} first.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
