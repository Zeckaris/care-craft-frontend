import {
  BarChart,
  Bar,
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

export const GradeTrendChart = () => {
  return (
    <Card title="Grade Distribution (2023–2025)" className="chart-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="2023" fill="#8884d8" />
          <Bar dataKey="2024" fill="#82ca9d" />
          <Bar dataKey="2025" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
