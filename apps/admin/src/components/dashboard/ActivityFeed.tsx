import { List, Avatar, Typography } from "antd";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";

const { Text } = Typography;

export const ActivityFeed = () => {
  const { activities, goToActivity } = useRecentActivity();

  return (
    <div className="activity-feed">
      <Text strong style={{ fontSize: 16, display: "block", marginBottom: 12 }}>
        Recent Activity
      </Text>
      <List
        size="small"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: "pointer",
              padding: "8px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
            onClick={() => goToActivity(item.path)}
          >
            <List.Item.Meta
              avatar={
                <Avatar size="small" style={{ background: "var(--primary)" }}>
                  {item.user[0]}
                </Avatar>
              }
              title={
                <Text strong style={{ fontSize: 13 }}>
                  {item.user} {item.action} {item.entity}
                </Text>
              }
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.target} •{" "}
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};
