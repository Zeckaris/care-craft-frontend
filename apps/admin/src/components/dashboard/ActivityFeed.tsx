import { Avatar, Tag, Typography } from "antd";
import { formatDistanceToNow } from "date-fns";
import type { DashboardRecentActivity } from "@/hooks/useDashboardStats";

const { Text } = Typography;

interface ActivityFeedProps {
  activities: DashboardRecentActivity[];
}

const roleLabel = (role: DashboardRecentActivity["actorRole"]) =>
  role === "admin" ? "Admin" : "Coordinator";

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
        {activities.map((item) => {
          const createdAt = new Date(item.createdAt);
          const initial =
            item.actorName.trim().charAt(0).toUpperCase() || "?";

          return (
            <div key={item.id} className="activity-item">
              <Avatar
                size={28}
                className="activity-avatar"
                style={{
                  background: "var(--primary)",
                  fontWeight: "bold",
                  fontSize: 13,
                  flexShrink: 0,
                  color: "var(--white)",
                }}
              >
                {initial}
              </Avatar>

              <div
                style={{
                  marginLeft: 10,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <Text
                    strong
                    style={{ fontSize: 13, color: "var(--text-dark)" }}
                  >
                    {item.actorName}
                  </Text>
                  <Tag
                    style={{
                      marginInlineEnd: 0,
                      fontSize: 10,
                      lineHeight: "16px",
                      paddingInline: 6,
                    }}
                  >
                    {roleLabel(item.actorRole)}
                  </Tag>
                </div>
                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-dark)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.message}
                </Text>
              </div>

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
                {Number.isNaN(createdAt.getTime())
                  ? ""
                  : formatDistanceToNow(createdAt, { addSuffix: true })}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
};
