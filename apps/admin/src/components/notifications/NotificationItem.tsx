import { Card, Tooltip, Typography, Space } from "antd";
import { formatDistanceToNow } from "date-fns";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { useState } from "react";

const { Text } = Typography;

interface NotificationItemProps {
  notification: {
    _id: string;
    title?: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    type?: string;
  };
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const isUnread = !notification.isRead;

  // Use title if available, else first ~50 chars of message
  const displayTitle = notification.title
    ? notification.title
    : notification.message.slice(0, 50) +
      (notification.message.length > 50 ? "..." : "");

  const fullPreview = notification.title
    ? `${notification.title}\n\n${notification.message}`
    : notification.message;

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        hoverable
        style={{
          marginBottom: 12,
          background: isUnread ? "#f0f9ff" : "#ffffff",
          borderColor: isUnread ? "#91caff" : "#f0f0f0",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        styles={{ body: { padding: "12px 16px" } }}
        onClick={() => setModalOpen(true)}
      >
        <Space align="start" size={12} style={{ width: "100%" }}>
          {isUnread && (
            <div
              style={{
                width: 10,
                height: 10,
                background: "#1890ff",
                borderRadius: "50%",
                marginTop: 6,
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <Tooltip title={fullPreview}>
              <Text
                strong={isUnread}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayTitle}
              </Text>
            </Tooltip>

            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginTop: 4 }}
            >
              {timeAgo}
            </Text>
          </div>

          {isUnread && (
            <div
              style={{
                opacity: 0,
                transition: "opacity 0.2s",
                fontSize: 12,
                color: "#1890ff",
              }}
              className="hover-cue"
            >
              View details
            </div>
          )}
        </Space>
      </Card>

      <NotificationDetailModal
        notification={notification}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
