import { Typography, Breadcrumb as AntBreadcrumb } from "antd";
import { Link } from "react-router-dom";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

const { Text } = Typography;

export const Breadcrumb = () => {
  const crumbs = useBreadcrumb();

  return (
    <AntBreadcrumb separator="→" style={{ marginBottom: 16 }}>
      <AntBreadcrumb.Item>
        <Text strong>Welcome, Amanuel</Text>
      </AntBreadcrumb.Item>
      {crumbs.map((crumb, index) => (
        <AntBreadcrumb.Item key={index}>
          {index === crumbs.length - 1 ? (
            <Text strong style={{ color: "var(--primary)" }}>
              {crumb}
            </Text>
          ) : (
            <Link to="#" style={{ color: "var(--dark)" }}>
              {crumb}
            </Link>
          )}
        </AntBreadcrumb.Item>
      ))}
    </AntBreadcrumb>
  );
};
