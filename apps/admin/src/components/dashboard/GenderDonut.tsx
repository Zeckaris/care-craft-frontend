import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "antd";

interface GenderDonutProps {
  data: Array<{ name: "M" | "F"; value: number }>;
  total: number;
}

const COLORS = {
  Male: "var(--primary)",
  Female: "var(--accent)",
};

export const GenderDonut = ({ data, total }: GenderDonutProps) => {
  const displayData = data.map((item) => ({
    ...item,
    name: item.name === "M" ? "Male" : "Female",
  }));

  return (
    <Card title="Gender Distribution" className="gender-card">
      <div className="gender-donut">
        <div className="gender-donut-chart">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={64}
                paddingAngle={4}
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="gender-donut-legend">
          {displayData.map((item) => (
            <div key={item.name} className="gender-donut-legend-item">
              <span
                className="gender-donut-swatch"
                style={{
                  background: COLORS[item.name as keyof typeof COLORS],
                }}
              />
              <span className="gender-donut-label">{item.name}</span>
              <span className="gender-donut-value">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="gender-donut-total">
            <span>Total</span>
            <strong>{total.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
};
