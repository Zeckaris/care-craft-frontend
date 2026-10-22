import type { INotification } from '@carecraft/types';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatNotificationDateTime, timeAgo } from './notification-utils';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: INotification;
  onSelect: (notification: INotification) => void;
}

export function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const isUnread = !notification.isRead;
  const isUrgent = notification.priority === 'urgent';
  const isLow = notification.priority === 'low';

  const relativeTime = timeAgo(notification.createdAt);
  const fullDateTime = formatNotificationDateTime(notification.createdAt);

  const displayTitle = notification.title
    ? notification.title
    : notification.message.length > 55
      ? `${notification.message.slice(0, 55)}...`
      : notification.message;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(notification);
        }
      }}
      className={cn(
        'group relative flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] border text-left cursor-pointer transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        isUnread
          ? 'bg-[var(--color-surface-raised)] border-[var(--color-primary)]/20 shadow-xs hover:border-[var(--color-primary)]/40'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-raised)]',
        isUrgent && 'border-l-4 border-l-[var(--color-danger)]'
      )}
    >
      {/* Unread indicator dot */}
      <div className="pt-1.5 shrink-0">
        {isUnread ? (
          <span
            className="block w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]"
            aria-label="Unread notification"
          />
        ) : (
          <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Priority & type header chips */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-danger-light)] text-[var(--color-danger)]">
              <AlertTriangle size={11} className="shrink-0" />
              Urgent
            </span>
          )}
          {isLow && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              Low
            </span>
          )}
          {notification.type && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase tracking-wider">
              {notification.type}
            </span>
          )}
        </div>

        {/* Title */}
        <h4
          className={cn(
            'text-sm leading-snug truncate',
            isUnread
              ? 'font-bold text-[var(--color-text)]'
              : 'font-medium text-[var(--color-text-secondary)]'
          )}
          title={notification.title || notification.message}
        >
          {displayTitle}
        </h4>

        {/* Message snippet */}
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Timestamp */}
        <div
          className="mt-2 flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]"
          title={`Received on ${fullDateTime}`}
        >
          <Clock size={12} className="shrink-0" />
          <span>{relativeTime}</span>
          <span className="text-[var(--color-text-muted)]/60">·</span>
          <span>{fullDateTime}</span>
        </div>
      </div>
    </div>
  );
}
