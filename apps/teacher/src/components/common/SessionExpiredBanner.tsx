/**
 * SessionExpiredBanner — non-blocking prompt shown when an offline queue has
 * been paused by an expired session (401). Shared by attendance and grades.
 *
 * Deliberately not a redirect: queued records are safe on the device, so the
 * teacher keeps full access to the screen they are on until they sign in again.
 */
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface SessionExpiredBannerProps {
  authRequired: boolean;
  hasUnsynced: boolean;
  /** Human name for what is queued, e.g. "attendance" or "marks". */
  contextLabel: string;
}

export function SessionExpiredBanner({
  authRequired,
  hasUnsynced,
  contextLabel,
}: SessionExpiredBannerProps) {
  const navigate = useNavigate();

  if (!authRequired) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]"
    >
      <LogIn size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Your session has expired</p>
        <p className="mt-0.5 text-[var(--color-text-secondary)]">
          {hasUnsynced
            ? `Your saved ${contextLabel} is on this device. Sign in again to sync it.`
            : `Sign in again to keep saving and syncing ${contextLabel}.`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/signin')}
        className="shrink-0 text-xs font-bold text-[var(--color-warning)] underline"
      >
        Sign in
      </button>
    </div>
  );
}
