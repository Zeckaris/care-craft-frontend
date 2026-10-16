/**
 * AppHeader — compact sticky top bar for the teacher app.
 *
 * Shows the page title (from context) and a notification/profile
 * slot. Accounts for the device safe-area-inset-top.
 */
import { useUser } from '@/context/UserContext';
import { SyncStatusButton } from '@/components/common/SyncStatusButton';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { user } = useUser();

  return (
    <header
      className="sticky top-0 z-30 bg-[var(--color-header)] border-b border-[var(--color-header-border)] shadow-xs"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        {/* Left — page title */}
        <h1 className="text-base sm:text-lg font-bold text-[var(--color-header-fg)] truncate max-w-[65%]">
          {title}
        </h1>

        {/* Right — sync status, notification bell slot & user greeting */}
        <div className="flex items-center gap-3 shrink-0">
          <SyncStatusButton />

          {/* Notification bell slot reserved for future task */}
          <div
            id="header-notifications-slot"
            className="flex items-center justify-center p-1.5 rounded-full text-[var(--color-header-muted)] hover:text-[var(--color-header-fg)] transition-colors"
            aria-label="Notifications"
          >
            {/* Slot placeholder for upcoming notification bell */}
          </div>

          {user && (
            <span className="text-xs sm:text-sm font-medium text-[var(--color-header-muted)]">
              Hi, {user.firstName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
