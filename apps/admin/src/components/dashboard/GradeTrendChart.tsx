import { useMemo } from "react";
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
import { Card, Empty } from "antd";
import type { EnrollmentTrend } from "@/hooks/useDashboardStats";

const LINE_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
];

const EMPTY_YEARS: string[] = [];

interface GradeTrendChartProps {
  data: EnrollmentTrend | null;
}

type TrendRow = {
  grade: string;
  [year: string]: string | number;
};

export const GradeTrendChart = ({ data }: GradeTrendChartProps) => {
  const years = data?.years ?? EMPTY_YEARS;
  const rows = useMemo<TrendRow[]>(
    () =>
      (data?.grades ?? []).map((item) => {
        const row: TrendRow = { grade: item.grade };
        years.forEach((year, index) => {
          row[year] = item.counts[index] ?? 0;
        });
        return row;
      }),
    [data, years]
  );

  const title =
    years.length > 0
      ? `Student Enrollment Trend (${years[0]}–${years[years.length - 1]})`
      : "Student Enrollment Trend";

  return (
    <Card title={title} className="trend-card" style={{ height: "100%" }}>
      {rows.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No enrollment trend data yet"
        />
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={rows}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
            />
            <XAxis
              dataKey="grade"
              tick={{ fontSize: 12, fill: "var(--text-dark)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--text-dark)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-color)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
              }}
              labelStyle={{ color: "var(--text-dark)" }}
              itemStyle={{ color: "var(--text-dark)" }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingBottom: 10,
                color: "var(--text-dark)",
              }}
            />

            {years.map((year, index) => {
              const color = LINE_COLORS[index % LINE_COLORS.length];
              return (
                <Line
                  key={year}
                  type="monotone"
                  dataKey={year}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name={year}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
