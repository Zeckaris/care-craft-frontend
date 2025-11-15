import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "antd";

interface GenderDonutProps {
  data: Array<{ name: "M" | "F"; value: number }>;
  total: number;
}

const COLORS = {
  Male: "#1890ff",
  Female: "#ff4d4f",
};

export const GenderDonut = ({ data, total }: GenderDonutProps) => {
  const displayData = data.map((item) => ({
    ...item,
    name: item.name === "M" ? "Male" : "Female",
  }));

  return (
    <Card title="Gender Distribution" className="chart-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 24,
          fontWeight: "bold",
          color: "var(--text-primary)",
        }}
      >
        {total.toLocaleString()} Total
      </div>
    </Card>
  );
};
