import { Button, Card, Empty, Progress, Skeleton, Tag, Typography } from "antd";
import {
  CrownOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ClassPerformance } from "@/hooks/useClassPerformance";

const { Text } = Typography;

interface ClassPerformanceCardProps {
  performance: ClassPerformance | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const formatAverage = (average: number) =>
  Number.isFinite(average) ? `${average.toFixed(1)}%` : "N/A";

export const ClassPerformanceCard = ({
  performance,
  isLoading = false,
  isError = false,
  onRetry,
}: ClassPerformanceCardProps) => {
  const topClasses = performance?.topClasses.slice(0, 3) ?? [];
  const context = performance?.termName ?? performance?.schoolYear;
  const threshold = performance?.threshold ?? 80;

  return (
    <Card
      className="dashboard-card performance-card"
      title={
        <div className="dashboard-card-header">
          <div className="dashboard-card-header-left">
            <div className="dashboard-card-icon">
              <TrophyOutlined />
            </div>
            <div className="dashboard-card-title-group">
              <span className="dashboard-card-title">Top Performing Classes</span>
              <span className="dashboard-card-subtitle">
                Based on locked assessment results
              </span>
            </div>
          </div>
          {context && (
            <Tag bordered={false} className="dashboard-card-tag">
              {context}
            </Tag>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="dashboard-card-skeleton">
          {[1, 2, 3].map((key) => (
            <div key={key} className="skeleton-class-row">
              <Skeleton.Avatar active shape="square" size={32} className="skeleton-rank-badge" />
              <div className="skeleton-class-content">
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="dashboard-card-state-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="dashboard-state-text">
                Failed to load class performance data
              </Text>
            }
          >
            {onRetry && (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRetry}
                className="dashboard-state-retry-btn"
              >
                Retry
              </Button>
            )}
          </Empty>
        </div>
      ) : topClasses.length === 0 ? (
        <div className="dashboard-card-state-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="dashboard-state-text">
                No locked assessment results yet
              </Text>
            }
          />
        </div>
      ) : (
        <div className="performance-list">
          {topClasses.map((item, index) => {
            const rank = index + 1;
            const abovePercent =
              item.studentCount > 0
                ? Math.min(100, Math.round((item.countAbove80 / item.studentCount) * 100))
                : 0;

            return (
              <div key={item.sectionId} className="performance-row">
                <div
                  className={`performance-rank-badge performance-rank-badge--${rank}`}
                  title={`Rank ${rank}`}
                >
                  {rank === 1 ? (
                    <CrownOutlined className="rank-crown-icon" />
                  ) : (
                    <span>{rank}</span>
                  )}
                </div>

                <div className="performance-info">
                  <div className="performance-info-header">
                    <span
                      className="performance-class-name"
                      title={`${item.gradeLevel} ${item.sectionName}`}
                    >
                      {item.gradeLevel} {item.sectionName}
                    </span>
                    <div className="performance-average-block">
                      <span className="performance-average-value">
                        {formatAverage(item.average)}
                      </span>
                      <span className="performance-average-label">avg</span>
                    </div>
                  </div>

                  <div className="performance-progress-wrap">
                    <Progress
                      percent={abovePercent}
                      showInfo={false}
                      strokeColor="var(--primary)"
                      trailColor="var(--border-color)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      className="performance-progress-bar"
                    />
                  </div>

                  <div className="performance-detail-wrap">
                    <span className="performance-detail-text">
                      {item.countAbove80} of {item.studentCount} above {threshold}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
