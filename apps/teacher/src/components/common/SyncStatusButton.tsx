/**
 * SyncStatusButton — header entry point to the on-device attendance queue.
 * Shown only when something is waiting to sync or has failed.
 */
import { useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useAttendanceQueue } from '@/context/AttendanceQueueContext';
import { SyncQueuePanel } from '@/components/attendance/SyncQueuePanel';
import { cn } from '@/lib/utils';

export function SyncStatusButton() {
  const { pendingCount, conflictCount, failedCount, hasUnsynced, syncing } = useAttendanceQueue();
  const [open, setOpen] = useState(false);

  if (!hasUnsynced && !syncing) return null;

  const failed = conflictCount + failedCount;
  const label = failed > 0 ? `${failed}` : `${pendingCount}`;

  return (
    <>
      <button
        type="button"
        id="header-sync-status"
        onClick={() => setOpen(true)}
        aria-label={`Attendance sync: ${pendingCount} pending, ${failed} need attention`}
        className={cn(
          'relative flex items-center justify-center rounded-full p-1.5 transition-colors',
          failed > 0
            ? 'text-[var(--color-danger)]'
            : 'text-[var(--color-header-muted)] hover:text-[var(--color-header-fg)]',
        )}
      >
        <CloudOff size={20} />
        {label !== '0' && (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
              failed > 0 ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-warning)]',
            )}
          >
            {label}
          </span>
        )}
        {syncing && (
          <RefreshCw
            size={12}
            className="absolute -bottom-0.5 -right-0.5 animate-spin text-[var(--color-header-muted)]"
          />
        )}
      </button>
      <SyncQueuePanel open={open} onOpenChange={setOpen} />
    </>
  );
}
