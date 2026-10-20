import { Card, Empty, Progress, Skeleton, Typography } from "antd";
import type { ClassPerformance } from "@/hooks/useClassPerformance";

const { Text } = Typography;

interface ClassPerformanceCardProps {
  performance: ClassPerformance | null;
  isLoading?: boolean;
}

const formatAverage = (average: number) =>
  Number.isFinite(average) ? `${average.toFixed(1)}%` : "—";

export const ClassPerformanceCard = ({
  performance,
  isLoading = false,
}: ClassPerformanceCardProps) => {
  const topClasses = performance?.topClasses.slice(0, 3) ?? [];
  const context = performance?.termName ?? performance?.schoolYear;
  const threshold = performance?.threshold ?? 80;

  return (
    <Card
      className="performance-card"
      title={
        <div className="performance-title">
          <span>
            Top performing classes{context ? ` · ${context}` : ""}
          </span>
          <span className="performance-subtitle">
            based on locked assessment results
          </span>
        </div>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : topClasses.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No locked assessment results yet"
        />
      ) : (
        <div className="performance-list">
          {topClasses.map((item, index) => {
            const abovePercent =
              item.studentCount > 0
                ? Math.round((item.countAbove80 / item.studentCount) * 100)
                : 0;

            return (
              <div key={item.sectionId} className="performance-row">
                <div className="performance-rank">{index + 1}</div>

                <div className="performance-info">
                  <div className="performance-heading">
                    <Text strong className="performance-class">
                      {item.gradeLevel} {item.sectionName}
                    </Text>
                    <span className="performance-average">
                      {formatAverage(item.average)}
                    </span>
                  </div>

                  <Text type="secondary" className="performance-detail">
                    {item.countAbove80} of {item.studentCount} above {threshold}%
                  </Text>

                  <Progress
                    percent={abovePercent}
                    showInfo={false}
                    strokeColor="var(--primary)"
                    trailColor="var(--border-color)"
                    strokeWidth={4}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
