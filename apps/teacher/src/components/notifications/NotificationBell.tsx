import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import type { INotification } from '@carecraft/types';
import { useNotificationCounts } from '@/hooks/notifications/useNotificationCounts';
import { useNotificationActions } from '@/hooks/notifications/useNotificationActions';
import { NotificationListPanel } from './NotificationListPanel';
import { NotificationDetailModal } from './NotificationDetailModal';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const counts = useNotificationCounts();
  const { markAsRead, isOnline } = useNotificationActions();

  const unreadCount = counts.unreadCount;
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectNotification = (notification: INotification) => {
    setSelectedNotification(notification);
    if (!notification.isRead && isOnline) {
      markAsRead(notification._id);
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative inline-flex items-center">
        {/* Bell button with fixed size to guarantee zero layout shift */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-full transition-colors',
            'text-[var(--color-header-muted)] hover:text-[var(--color-header-fg)] hover:bg-white/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
            isOpen && 'bg-white/15 text-[var(--color-header-fg)]'
          )}
        >
          <Bell size={20} />

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full text-[10px] font-bold leading-none pointer-events-none shadow-xs',
                'bg-[var(--color-danger)] text-[var(--color-danger-fg)]'
              )}
            >
              {badgeLabel}
            </span>
          )}
        </button>

        {/* Desktop Popover (visible on lg+) */}
        {isOpen && (
          <div className="hidden lg:block absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[80vh] rounded-[var(--radius-xl)] shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <NotificationListPanel
              onClose={() => setIsOpen(false)}
              onSelectNotification={handleSelectNotification}
            />
          </div>
        )}
      </div>

      {/* Mobile & Tablet Full-Height Sheet (visible below lg, fits bottom navigation) */}
      {isOpen && (
        <div className="lg:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet container: spans from header bottom to above bottom nav */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            className="fixed inset-x-0 z-40 flex flex-col bg-[var(--color-surface)] shadow-2xl border-t border-[var(--color-border)] animate-in slide-in-from-bottom duration-200"
            style={{
              top: 'calc(3.5rem + var(--safe-top, 0px))',
              bottom: 'calc(var(--bottom-nav-h, 4rem) + var(--safe-bottom, 0px))',
            }}
          >
            <NotificationListPanel
              onClose={() => setIsOpen(false)}
              onSelectNotification={handleSelectNotification}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={markAsRead}
        isOnline={isOnline}
      />
    </>
  );
}
