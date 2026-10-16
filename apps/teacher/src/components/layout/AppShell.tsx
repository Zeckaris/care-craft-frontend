/**
 * AppShell — the authenticated app layout.
 *
 * Renders the AppHeader, main content area (with bottom-nav padding),
 * and the BottomNav. All authenticated routes render inside this shell.
 */
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { OnlineIndicator } from '@/components/common/OnlineIndicator';
import { AttendanceAuthBanner } from '@/components/attendance/AttendanceAuthBanner';

/** Map route paths to human-readable page titles. */
const PAGE_TITLES: Record<string, string> = {
  '/app/home':    'Teacher Dashboard',
  '/app/profile': 'Teacher Profile',
};

function usePageTitle(): string {
  const { pathname } = useLocation();
  // Check exact match first, then prefix-match for nested routes
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key));
  return match ? match[1] : 'CareCraft Teacher';
}

export function AppShell() {
  const title = usePageTitle();

  return (
    <div className="flex min-h-dvh bg-[var(--color-bg)]">
      <OnlineIndicator />

      {/* Desktop Sidebar (hidden on phone & tablet, visible on lg+) */}
      <DesktopSidebar />

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader title={title} />

        {/* Content area: padded at bottom only for mobile/tablet where BottomNav is fixed */}
        <main
          className="flex-1 overflow-y-auto pb-[calc(var(--bottom-nav-h)+var(--safe-bottom))] lg:pb-12"
        >
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-5">
            <AttendanceAuthBanner />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile & Tablet Bottom Navigation (hidden on lg+) */}
      <BottomNav />
    </div>
  );
}
