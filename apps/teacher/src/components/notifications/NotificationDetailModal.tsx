import { useEffect } from 'react';
import type { INotification } from '@carecraft/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatNotificationDateTime, timeAgo } from './notification-utils';

interface NotificationDetailModalProps {
  notification: INotification | null;
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  isOnline: boolean;
}

export function NotificationDetailModal({
  notification,
  open,
  onClose,
  onMarkAsRead,
  isOnline,
}: NotificationDetailModalProps) {
  useEffect(() => {
    if (open && notification && !notification.isRead && isOnline) {
      onMarkAsRead(notification._id);
    }
  }, [open, notification, isOnline, onMarkAsRead]);

  if (!notification) return null;

  const isUrgent = notification.priority === 'urgent';
  const isLow = notification.priority === 'low';
  const relativeTime = timeAgo(notification.createdAt);
  const fullDateTime = formatNotificationDateTime(notification.createdAt);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={notification.title || 'Notification Details'}
    >
      <div className="space-y-4">
        {/* Meta badges and timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-danger-light)] text-[var(--color-danger)]">
                <AlertTriangle size={12} className="shrink-0" />
                Urgent Priority
              </span>
            )}
            {isLow && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                Low Priority
              </span>
            )}
            {!isUrgent && !isLow && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                Normal Priority
              </span>
            )}
            {notification.type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase tracking-wider">
                {notification.type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Clock size={13} className="shrink-0" />
            <span>{relativeTime}</span>
          </div>
        </div>

        {/* Full message body */}
        <div className="py-2">
          <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Date and time footer note */}
        <div className="text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
          Received: {fullDateTime}
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
