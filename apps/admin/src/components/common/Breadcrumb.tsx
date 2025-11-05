// src/components/common/Breadcrumb.tsx
import { Breadcrumb as AntBreadcrumb, Typography } from "antd";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

const { Text } = Typography;

export const Breadcrumb = () => {
  const crumbs = useBreadcrumb();

  // === DASHBOARD MODE: Only one crumb and it's "Dashboard" ===
  if (crumbs.length === 1 && crumbs[0] === "Dashboard") {
    return (
      <div className="dashboard-breadcrumb">
        <h2 className="welcome-title">Welcome, Amanuel</h2>
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
              <Text strong style={{ color: "var(--primary)" }}>
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
