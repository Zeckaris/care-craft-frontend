/**
 * DesktopSidebar — side navigation bar for desktop viewports (>= 1024px).
 *
 * Shows:
 *  • School branding (logo + name)
 *  • Navigation links (shared with BottomNav)
 *  • User summary pill at the bottom
 */
import { NavLink } from 'react-router-dom';
import { useBranding } from '@/context/BrandingContext';
import { useUser } from '@/context/UserContext';
import { NAV_ITEMS } from './navItems';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

export function DesktopSidebar() {
  const { branding } = useBranding();
  const { user } = useUser();

  const schoolName = branding?.name || 'CareCraft';
  const logoUrl = branding?.logo;

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 h-dvh sticky top-0 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] z-20"
      aria-label="Desktop sidebar"
    >
      {/* School Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--color-sidebar-border)]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={schoolName}
            className="h-9 w-9 rounded-[var(--radius-md)] object-contain border border-[var(--color-sidebar-border)] bg-[var(--color-surface)] shrink-0"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-fg)] shadow-sm font-bold text-sm">
            <GraduationCap size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[var(--color-sidebar-fg)] truncate leading-tight">
            {schoolName}
          </h2>
          <span className="text-xs text-[var(--color-sidebar-muted)] font-medium">
            Teacher Portal
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5" aria-label="Desktop Navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => (
          <NavLink
            key={to}
            id={`${id}-desktop`}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-fg)] font-semibold shadow-xs'
                  : 'text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-fg)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className="shrink-0"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="p-4 border-t border-[var(--color-sidebar-border)] m-2 bg-[var(--color-sidebar-hover)] rounded-[var(--radius-lg)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold text-sm shadow-xs">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-sidebar-fg)] truncate">
                {user.firstName}
              </p>
              <p className="text-[11px] text-[var(--color-sidebar-muted)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
