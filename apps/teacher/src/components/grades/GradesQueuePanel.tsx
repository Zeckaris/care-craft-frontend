/**
 * GradesQueuePanel — surfaces everything saved on this device for marks:
 * records waiting to sync, conflicts needing a decision, and skipped /
 * rejected outcomes.
 */
import { CloudOff, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import type { GradesQueueEntry } from '@carecraft/grades';
import { useGradesQueue } from '@/context/GradesQueueContext';
import { formatTime, shortId } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface EntryCardProps {
  entry: GradesQueueEntry;
  onKeepServer: (key: string, studentId: string) => void;
  onOverwrite: (key: string, studentId: string) => void;
  onDiscard: (key: string) => void;
}

function EntryCard({ entry, onKeepServer, onOverwrite, onDiscard }: EntryCardProps) {
  const rejected = entry.outcomes.filter((o) => o.action === 'rejected');
  const skipped = entry.outcomes.filter((o) => o.action === 'skipped');
  const title = [entry.sectionLabel, entry.subjectName, entry.typeName]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--color-text)]">
            {title || 'Marks'}
          </p>
          {entry.maxScore != null && (
            <p className="text-xs text-[var(--color-text-muted)]">out of {entry.maxScore}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-[var(--color-text-muted)]"
          onClick={() => onDiscard(entry.key)}
          title="Discard saved changes"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {entry.pending.length > 0 && (
          <Badge variant="warning">{entry.pending.length} waiting to sync</Badge>
        )}
        {entry.conflicts.length > 0 && (
          <Badge variant="danger">{entry.conflicts.length} conflict</Badge>
        )}
        {rejected.length > 0 && <Badge variant="danger">{rejected.length} rejected</Badge>}
        {skipped.length > 0 && <Badge variant="neutral">{skipped.length} skipped</Badge>}
      </div>

      {entry.lastError && rejected.length > 0 && (
        <p className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-danger-light)] px-2 py-1 text-xs text-[var(--color-danger)]">
          {entry.lastError}
        </p>
      )}

      {entry.conflicts.map((conflict) => (
        <div
          key={conflict.studentId}
          className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] p-2.5"
        >
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-warning)]">
            <TriangleAlert size={13} /> {shortId(conflict.studentId)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Server now shows{' '}
            <strong className="text-[var(--color-text)]">
              {conflict.stored?.score ?? 'no mark'}
            </strong>
            {conflict.stored?.updatedAt ? ` (changed ${formatTime(conflict.stored.updatedAt)})` : ''}.
            You have <strong className="text-[var(--color-text)]">{conflict.ours.score}</strong>.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onKeepServer(entry.key, conflict.studentId)}
            >
              Keep server
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onOverwrite(entry.key, conflict.studentId)}
            >
              Use mine
            </Button>
          </div>
        </div>
      ))}

      {(rejected.length > 0 || skipped.length > 0) && (
        <ul className="mt-2 space-y-1">
          {[...rejected, ...skipped].map((outcome, index) => (
            <li
              key={`${outcome.studentId}-${index}`}
              className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]"
            >
              <span
                className={`mt-0.5 shrink-0 font-semibold ${
                  outcome.action === 'rejected'
                    ? 'text-[var(--color-danger)]'
                    : 'text-[var(--color-warning)]'
                }`}
              >
                {outcome.action === 'rejected' ? 'Rejected' : 'Skipped'}
              </span>
              <span className="min-w-0">
                {shortId(outcome.studentId)}
                {outcome.reason ? `. ${outcome.reason}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface GradesQueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GradesQueuePanel({ open, onOpenChange }: GradesQueuePanelProps) {
  const {
    entries,
    pendingCount,
    conflictCount,
    failedCount,
    syncing,
    syncNow,
    keepServerValue,
    overwriteWithMine,
    discardEntry,
  } = useGradesQueue();

  const visibleEntries = entries.filter(
    (entry) => entry.pending.length > 0 || entry.conflicts.length > 0 || entry.outcomes.length > 0,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Saved on this device"
      description="Marks are stored locally and sync automatically when online."
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {pendingCount > 0 && <Badge variant="warning">{pendingCount} pending</Badge>}
          {conflictCount > 0 && <Badge variant="danger">{conflictCount} conflict</Badge>}
          {failedCount > 0 && <Badge variant="danger">{failedCount} failed</Badge>}
          {visibleEntries.length === 0 && <Badge variant="success">Everything is synced</Badge>}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          loading={syncing}
          onClick={() => void syncNow(true)}
        >
          <RefreshCw size={14} /> Retry now
        </Button>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CloudOff size={28} className="mb-2 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No marks are waiting on this device.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleEntries.map((entry) => (
            <EntryCard
              key={entry.key}
              entry={entry}
              onKeepServer={keepServerValue}
              onOverwrite={overwriteWithMine}
              onDiscard={discardEntry}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
