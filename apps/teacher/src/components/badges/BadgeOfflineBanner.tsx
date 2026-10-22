import { WifiOff } from 'lucide-react';

export function BadgeOfflineBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] p-3 text-[var(--color-warning)]"
    >
      <WifiOff size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">You are offline</p>
        <p className="mt-0.5 text-xs opacity-90">
          Connect to the internet to view badge progress and manage awards.
        </p>
      </div>
    </div>
  );
}
