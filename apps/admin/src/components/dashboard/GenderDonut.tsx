import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "antd";

const data = [
  { name: "Male", value: 682, color: "#1890ff" },
  { name: "Female", value: 566, color: "#ff4d4f" },
];

export const GenderDonut = () => {
  return (
    <Card title="Gender Distribution" className="chart-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
        }}
      >
        1,248 Total
      </div>
    </Card>
  );
};
