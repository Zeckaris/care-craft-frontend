import { List, Spin, Empty, Alert } from "antd";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/hooks/notifications/notification.type";
import { EmptyState } from "@/components/common/EmptyState";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  emptyMessage?: string; // optional custom message per tab
}

export const NotificationList = ({
  notifications,
  isLoading,
  isError,
  error,
  emptyMessage = "No notifications found",
}: NotificationListProps) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Loading notifications..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error"
        description={
          error?.message || "Failed to load notifications. Please try again."
        }
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  if (notifications.length === 0) {
    return <EmptyState title="No notifications" description={emptyMessage} />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={notifications}
      renderItem={(notification) => (
        <List.Item style={{ padding: 0, border: "none" }}>
          <NotificationItem notification={notification} />
        </List.Item>
      )}
      style={{ background: "transparent" }}
    />
  );
};
