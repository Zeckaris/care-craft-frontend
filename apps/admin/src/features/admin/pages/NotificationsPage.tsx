import { useState } from "react";
import { Typography, Segmented, Space, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotificationCounts } from "@/hooks/notifications/useNotificationCounts";
import { useUnreadNotifications } from "@/hooks/notifications/useUnreadNotifications";
import { useReadNotifications } from "@/hooks/notifications/useReadNotifications";
import { useAllNotifications } from "@/hooks/notifications/useAllNotifications";
import { useMarkAllUnreadAsRead } from "@/hooks/notifications/useMarkAllUnreadAsRead";

const { Title } = Typography;

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("unread");

  const counts = useNotificationCounts();
  const unread = useUnreadNotifications();
  const read = useReadNotifications();
  const all = useAllNotifications();

  const { markAllAsRead, isLoading: markAllLoading } = useMarkAllUnreadAsRead();

  const handleRefresh = () => {
    unread.refetch();
    read.refetch();
    all.refetch();
    counts.refetch();
  };

  const segments = [
    { label: `Unread (${counts.unreadCount})`, value: "unread" },
    { label: "Read", value: "read" },
    { label: `All (${counts.totalCount})`, value: "all" },
  ];

  const getCurrentList = () => {
    const isUnreadTab = activeTab === "unread";
    const isReadTab = activeTab === "read";
    const isAllTab = activeTab === "all";

    const current = isUnreadTab ? unread : isReadTab ? read : all;

    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {isUnreadTab && counts.unreadCount > 0 && (
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              onClick={markAllAsRead}
              loading={markAllLoading}
              disabled={markAllLoading || current.isLoading}
            >
              Mark all as read
            </Button>
          </div>
        )}

        <NotificationList
          notifications={current.notifications}
          isLoading={current.isLoading}
          isError={current.isError}
          error={current.error}
          emptyMessage={
            isUnreadTab
              ? "No unread notifications at the moment."
              : isReadTab
                ? "No read notifications yet."
                : "No notifications in history."
          }
        />
      </Space>
    );
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <Space
        direction="horizontal"
        align="center"
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Notifications
        </Title>

        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={
            unread.isLoading ||
            read.isLoading ||
            all.isLoading ||
            markAllLoading ||
            counts.isLoading
          }
          disabled={
            unread.isLoading ||
            read.isLoading ||
            all.isLoading ||
            markAllLoading ||
            counts.isLoading
          }
        >
          Refresh
        </Button>
      </Space>

      <Segmented
        options={segments}
        value={activeTab}
        onChange={(value) => setActiveTab(value as string)}
        block
        style={{ marginBottom: 24 }}
      />

      {getCurrentList()}
    </div>
  );
};
