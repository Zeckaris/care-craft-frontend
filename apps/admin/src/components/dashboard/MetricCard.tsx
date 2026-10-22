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
      <div className="metric-card-inner">
        <span className="metric-icon">{icon}</span>
        <span className="metric-value">{value}</span>
        <span className="metric-title">{title}</span>
      </div>
    </Card>
  );
};
