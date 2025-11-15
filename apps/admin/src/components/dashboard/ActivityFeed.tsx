import { Avatar, Typography } from "antd";
import { formatDistanceToNow } from "date-fns";

const { Text } = Typography;

export interface Activity {
  id: string;
  message: string;
  timestamp: Date;
  actionInitial: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <Text
          strong
          style={{
            fontSize: 16,
            display: "block",
            marginBottom: 12,
            color: "var(--text-dark)",
          }}
        >
          Recent Activity
        </Text>
        <Text
          type="secondary"
          style={{ fontSize: 13, color: "var(--text-dark)" }}
        >
          No recent activity
        </Text>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <Text
        strong
        style={{
          fontSize: 16,
          display: "block",
          marginBottom: 12,
          color: "var(--text-dark)",
        }}
      >
        Recent Activity
      </Text>

      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <Avatar
              size={28}
              className="activity-avatar"
              style={{
                background: "var(--primary)",
                fontWeight: "bold",
                fontSize: 13,
                flexShrink: 0,
                color: "white !important",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {item.actionInitial}
            </Avatar>

            <Text
              strong
              style={{
                fontSize: 13,
                color: "var(--text-dark)",
                marginLeft: 10,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.message}
            </Text>

            <Text
              type="secondary"
              style={{
                fontSize: 11,
                color: "var(--primary)",
                opacity: 0.9,
                marginLeft: 8,
                whiteSpace: "nowrap",
              }}
            >
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};
