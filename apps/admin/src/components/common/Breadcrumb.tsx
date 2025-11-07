import { Breadcrumb as AntBreadcrumb, Typography } from "antd";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { getUser } from "@/utils/auth";
import { useLocation } from "react-router-dom";

const { Text } = Typography;

export const Breadcrumb = () => {
  const crumbs = useBreadcrumb();
  const user = getUser();

  // === DASHBOARD MODE: Only one crumb and it's "Dashboard" ===
  if (location.pathname === "/dashboard") {
    return (
      <div className="dashboard-breadcrumb">
        <h2 className="welcome-title">
          Welcome {user.firstName ? user.firstName : "Admin"}
        </h2>
        <div className="dashboard-page-title">
          <Text strong style={{ color: "var(--primary)", fontSize: "16px" }}>
            Dashboard
          </Text>
        </div>
      </div>
    );
  }

  // === NORMAL MODE: Render trail from string[] ===
  if (crumbs.length === 0) return null;

  return (
    <AntBreadcrumb separator="→" style={{ marginBottom: 16, fontSize: "15px" }}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <AntBreadcrumb.Item key={index}>
            {isLast ? (
              <Text
                strong
                style={{
                  color: "var(--primary)",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {crumb}
              </Text>
            ) : (
              <span style={{ color: "var(--text)", fontWeight: 500 }}>
                {crumb}
              </span>
            )}
          </AntBreadcrumb.Item>
        );
      })}
    </AntBreadcrumb>
  );
};
