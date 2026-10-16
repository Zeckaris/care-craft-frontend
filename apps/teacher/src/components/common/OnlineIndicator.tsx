/**
 * OnlineIndicator — shows a small pill when the device is offline.
 * Hidden when online to keep the UI uncluttered.
 */
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export function OnlineIndicator() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full bg-[var(--color-warning)] px-3 py-1 text-xs font-semibold text-[var(--color-warning-fg)] shadow-lg"
      style={{ marginTop: 'var(--safe-top)' }}
    >
      <WifiOff size={13} />
      Offline
    </div>
  );
}
