import { Modal, Typography, Divider, Spin, Space } from "antd";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

const { Title, Text, Paragraph } = Typography;

interface NotificationDetailModalProps {
  notification: {
    _id: string;
    title?: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    type?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export const NotificationDetailModal = ({
  notification,
  open,
  onClose,
}: NotificationDetailModalProps) => {
  const { markAsRead, isLoading: markLoading } = useMarkNotificationAsRead();

  useEffect(() => {
    if (open && notification && !notification.isRead) {
      markAsRead(notification._id);
    }
  }, [open, notification]);

  if (!notification) return null;

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <Modal
      title={notification.title || notification.type || "Notification"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <Spin spinning={markLoading} size="small">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>
            {notification.message}
          </Paragraph>

          <Divider style={{ margin: "12px 0" }} />

          <Space direction="vertical" size={4}>
            <Text type="secondary">Sent {timeAgo}</Text>
            {notification.type && (
              <Text type="secondary">
                Type: <Text strong>{notification.type}</Text>
              </Text>
            )}
          </Space>
        </Space>
      </Spin>
    </Modal>
  );
};
