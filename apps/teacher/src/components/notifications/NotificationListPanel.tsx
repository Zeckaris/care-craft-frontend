import { useState } from 'react';
import type { INotification } from '@carecraft/types';
import {
  Bell,
  CheckCheck,
  RotateCw,
  WifiOff,
  X,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import {
  useTeacherNotifications,
  type NotificationTab,
} from '@/hooks/notifications/useTeacherNotifications';
import { useNotificationCounts } from '@/hooks/notifications/useNotificationCounts';
import { useNotificationActions } from '@/hooks/notifications/useNotificationActions';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NotificationListPanelProps {
  onClose: () => void;
  onSelectNotification: (notification: INotification) => void;
}

export function NotificationListPanel({
  onClose,
  onSelectNotification,
}: NotificationListPanelProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('unread');

  const counts = useNotificationCounts();
  const {
    notifications,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
    refetch,
  } = useTeacherNotifications(activeTab);

  const {
    markAllAsRead,
    isMarkingAllRead,
    isOnline,
  } = useNotificationActions();

  const handleRefresh = () => {
    refetch();
    counts.refetch();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] text-[var(--color-text)] select-none">
      {/* Panel Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)] truncate">
            Notifications
          </h2>

          {!isOnline && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-warning)] text-[var(--color-warning-fg)] shrink-0"
              title="You are offline. Showing cached notifications."
            >
              <WifiOff size={11} />
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Mark all as read button */}
          <button
            type="button"
            onClick={() => markAllAsRead()}
            disabled={!isOnline || isMarkingAllRead || counts.unreadCount === 0}
            title={
              !isOnline
                ? 'Unavailable offline'
                : counts.unreadCount === 0
                  ? 'No unread notifications'
                  : 'Mark all as read'
            }
            aria-label="Mark all as read"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/40 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              (!isOnline || counts.unreadCount === 0 || isMarkingAllRead) &&
                'opacity-40 cursor-not-allowed hover:bg-transparent text-[var(--color-text-muted)]'
            )}
          >
            <CheckCheck size={15} />
            <span className="hidden sm:inline">Mark all read</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh notifications"
            aria-label="Refresh notifications"
            className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <RotateCw size={15} className={cn(isLoading && 'animate-spin')} />
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Close notifications"
            aria-label="Close notifications panel"
            className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center border-b border-[var(--color-border)] px-4 bg-[var(--color-surface)] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors relative',
            activeTab === 'unread'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          <span>Unread</span>
          {counts.unreadCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'unread'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
              )}
            >
              {counts.unreadCount > 99 ? '99+' : counts.unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors',
            activeTab === 'all'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          <span>All</span>
          {counts.totalCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'all'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
              )}
            >
              {counts.totalCount > 99 ? '99+' : counts.totalCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {/* Loading skeleton */}
        {isLoading && notifications.length === 0 && (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="p-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-[var(--color-surface-raised)] rounded-sm" />
                  <div className="h-3 w-12 bg-[var(--color-surface-raised)] rounded-sm" />
                </div>
                <div className="h-4 w-3/4 bg-[var(--color-surface-raised)] rounded-sm" />
                <div className="h-3 w-full bg-[var(--color-surface-raised)] rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && notifications.length === 0 && (
          <div className="p-6 text-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] my-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center mb-3">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Failed to load notifications
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {error?.message || 'A network error occurred while fetching notifications.'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="mt-3.5"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-primary-light)]/50 text-[var(--color-primary)] flex items-center justify-center mb-3">
              {activeTab === 'unread' ? <Inbox size={24} /> : <Bell size={24} />}
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {activeTab === 'unread'
                ? "You're all caught up"
                : 'No notifications'}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
              {activeTab === 'unread'
                ? 'No unread notifications at the moment.'
                : 'You have not received any notifications yet.'}
            </p>
          </div>
        )}

        {/* Notification list */}
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onSelect={onSelectNotification}
          />
        ))}

        {/* Incremental pagination button */}
        {hasNextPage && (
          <div className="pt-2 pb-1 text-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full text-xs font-semibold py-2"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center justify-center gap-1.5">
                  <RotateCw size={13} className="animate-spin" />
                  Loading more...
                </span>
              ) : (
                'Load more notifications'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
