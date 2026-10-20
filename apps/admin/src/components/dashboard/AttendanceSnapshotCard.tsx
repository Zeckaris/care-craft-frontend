import { Button, Card, Empty, Progress, Skeleton, Tag, Typography } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import type { AttendanceSnapshot } from "@/hooks/useAttendanceSnapshot";

const { Text } = Typography;

interface AttendanceSnapshotCardProps {
  snapshot: AttendanceSnapshot | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const formatSnapshotDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : format(parsed, "EEE, MMM d");
};

export const AttendanceSnapshotCard = ({
  snapshot,
  isLoading = false,
  isError = false,
  onRetry,
}: AttendanceSnapshotCardProps) => {
  const dateLabel = snapshot?.date ? formatSnapshotDate(snapshot.date) : null;
  const markedPercent =
    snapshot && snapshot.expected > 0
      ? Math.min(100, Math.round((snapshot.marked / snapshot.expected) * 100))
      : 0;

  return (
    <Card
      className="dashboard-card snapshot-card"
      title={
        <div className="dashboard-card-header">
          <div className="dashboard-card-header-left">
            <div className="dashboard-card-icon">
              <CalendarOutlined />
            </div>
            <div className="dashboard-card-title-group">
              <span className="dashboard-card-title">Attendance</span>
              <span className="dashboard-card-subtitle">Daily student snapshot</span>
            </div>
          </div>
          {dateLabel && (
            <Tag bordered={false} className="dashboard-card-tag">
              {dateLabel}
            </Tag>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="dashboard-card-skeleton">
          <Skeleton.Button active block className="skeleton-hero-block" />
          <div className="skeleton-secondary-row">
            <Skeleton.Button active block className="skeleton-stat-block" />
            <Skeleton.Button active block className="skeleton-stat-block" />
            <Skeleton.Button active block className="skeleton-stat-block" />
          </div>
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        </div>
      ) : isError ? (
        <div className="dashboard-card-state-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="dashboard-state-text">
                Failed to load attendance data
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
      ) : !snapshot ? (
        <div className="dashboard-card-state-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="dashboard-state-text">
                Attendance data unavailable
              </Text>
            }
          />
        </div>
      ) : snapshot.date === null ? (
        <div className="dashboard-card-state-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="dashboard-state-text">
                No previous school day yet
              </Text>
            }
          />
        </div>
      ) : (
        <div className="snapshot-content">
          {/* Key Figure: Present students */}
          <div className="attendance-hero-card">
            <div className="attendance-hero-left">
              <span className="attendance-hero-label">Present</span>
              <span className="attendance-hero-value">
                {snapshot.present.toLocaleString()}
              </span>
            </div>
            <div className="attendance-hero-badge">
              <span className="status-indicator-dot status-indicator-dot--success" />
              <span className="attendance-hero-badge-text">In Attendance</span>
            </div>
          </div>

          {/* Supporting Details: Absent, Late, Excused */}
          <div className="attendance-secondary-grid">
            <div className="attendance-secondary-item attendance-secondary-item--danger">
              <div className="attendance-secondary-header">
                <CloseCircleOutlined className="attendance-secondary-icon" />
                <span className="attendance-secondary-label">Absent</span>
              </div>
              <span className="attendance-secondary-value">
                {snapshot.absent.toLocaleString()}
              </span>
            </div>

            <div className="attendance-secondary-item attendance-secondary-item--warning">
              <div className="attendance-secondary-header">
                <ClockCircleOutlined className="attendance-secondary-icon" />
                <span className="attendance-secondary-label">Late</span>
              </div>
              <span className="attendance-secondary-value">
                {snapshot.late.toLocaleString()}
              </span>
            </div>

            <div className="attendance-secondary-item attendance-secondary-item--neutral">
              <div className="attendance-secondary-header">
                <InfoCircleOutlined className="attendance-secondary-icon" />
                <span className="attendance-secondary-label">Excused</span>
              </div>
              <span className="attendance-secondary-value">
                {snapshot.excused.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Roll Call / Marking Progress */}
          <div className="snapshot-progress-section">
            <div className="snapshot-progress-header">
              <span className="snapshot-progress-title">
                {snapshot.marked.toLocaleString()} of {snapshot.expected.toLocaleString()} students marked
              </span>
              <span className="snapshot-progress-badge">{markedPercent}%</span>
            </div>

            <Progress
              percent={markedPercent}
              showInfo={false}
              strokeColor="var(--primary)"
              trailColor="var(--border-color)"
              strokeWidth={6}
              strokeLinecap="round"
              className="snapshot-progress-bar"
            />

            <div className="snapshot-footnote">
              <CheckCircleOutlined className="snapshot-footnote-icon" />
              <span className="snapshot-footnote-text">
                {snapshot.sectionsWithRecords} of {snapshot.totalSections} sections recorded
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
