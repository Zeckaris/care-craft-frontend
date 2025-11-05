// src/components/dashboard/GradeTrendChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "antd";

const data = [
  { grade: "Grade 1", "2023": 98, "2024": 102, "2025": 105 },
  { grade: "Grade 2", "2023": 95, "2024": 99, "2025": 103 },
  { grade: "Grade 3", "2023": 100, "2024": 98, "2025": 101 },
  { grade: "Grade 4", "2023": 92, "2024": 96, "2025": 99 },
  { grade: "Grade 5", "2023": 88, "2024": 93, "2025": 97 },
  { grade: "Grade 6", "2023": 85, "2024": 90, "2025": 94 },
  { grade: "Grade 7", "2023": 82, "2024": 87, "2025": 91 },
  { grade: "Grade 8", "2023": 80, "2024": 85, "2025": 89 },
  { grade: "Grade 9", "2023": 78, "2024": 82, "2025": 87 },
  { grade: "Grade 10", "2023": 75, "2024": 79, "2025": 84 },
  { grade: "Grade 11", "2023": 72, "2024": 76, "2025": 81 },
  { grade: "Grade 12", "2023": 88, "2024": 85, "2025": 90 },
];

const years = ["2023", "2024", "2025"];
const colors = ["#8884d8", "#82ca9d", "#ffc658"];

export const GradeTrendChart = () => {
  return (
    <Card
      title="Student Enrollment Trend (2023–2025)"
      className="chart-full"
      style={{ height: "100%" }}
    >
      <ResponsiveContainer width="100%" height={380}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="grade"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e0e0e0" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e0e0e0" }}
            domain={[70, 110]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingBottom: 10 }}
          />

          {years.map((year, index) => (
            <Line
              key={year}
              type="monotone"
              dataKey={year}
              stroke={colors[index]}
              strokeWidth={2.5}
              dot={{ r: 5, fill: colors[index], strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              name={year}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
