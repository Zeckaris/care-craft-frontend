/**
 * BottomNav — mobile-first bottom navigation bar.
 *
 * Tab items are defined locally; add more as features land.
 * Accounts for the device safe-area-inset-bottom.
 */
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navItems';

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-nav)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Main navigation"
    >
      <ul className="flex h-16 items-stretch" role="list">
        {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => (
          <li key={to} className="flex-1">
            <NavLink
              id={id}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-0.5',
                  'text-xs font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                )
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="shrink-0"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
