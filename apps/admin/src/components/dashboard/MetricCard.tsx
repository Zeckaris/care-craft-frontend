import { Card } from "antd";
import { type ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export const MetricCard = ({ title, value, icon }: MetricCardProps) => {
  return (
    <Card className="metric-card">
      <div style={{ fontSize: 32, color: "var(--accent)", marginBottom: 8 }}>
        {icon}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-title">{title}</div>
    </Card>
  );
};
