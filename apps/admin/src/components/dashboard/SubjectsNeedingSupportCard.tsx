import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Drawer,
  Empty,
  Progress,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type {
  PerformanceAlertsData,
  PerformanceAlertSubject,
} from "@/hooks/usePerformanceAlerts";

const { Text } = Typography;

interface SubjectsNeedingSupportCardProps {
  data: PerformanceAlertsData | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const formatAverage = (avg: number) =>
  Number.isFinite(avg) ? `${avg.toFixed(1)}%` : "N/A";

export const SubjectsNeedingSupportCard = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: SubjectsNeedingSupportCardProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const threshold = data?.threshold ?? 65;
  const subjectsList: PerformanceAlertSubject[] = data?.subjects ?? [];
  const totalCount = subjectsList.length;
  const displayedPreview = subjectsList.slice(0, 4);

  const termContext = data?.termName || data?.schoolYear;

  return (
    <>
      <Card
        className="dashboard-card attention-card"
        title={
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-left">
              <div className="dashboard-card-icon">
                <BookOutlined />
              </div>
              <div className="dashboard-card-title-group">
                <span className="dashboard-card-title">Subjects Needing Support</span>
                <span className="dashboard-card-subtitle">
                  {termContext
                    ? `${termContext} · Below ${threshold}% target`
                    : `Below ${threshold}% target`}
                </span>
              </div>
            </div>
            <Tag bordered={false} className="dashboard-card-tag">
              &lt; {threshold}%
            </Tag>
          </div>
        }
      >
        {isLoading ? (
          <div className="dashboard-card-skeleton">
            <Skeleton.Button active block className="skeleton-hero-block" />
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </div>
        ) : isError ? (
          <div className="dashboard-card-state-wrap">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" className="dashboard-state-text">
                  Failed to load performance alerts
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
        ) : data?.reason === "no-current-term" || data?.reason === "no-school-year" ? (
          <div className="dashboard-card-state-wrap">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="dashboard-calm-state">
                  <span className="dashboard-calm-title">
                    {data.reason === "no-current-term"
                      ? "No active academic term"
                      : "No active school year"}
                  </span>
                  <span className="dashboard-calm-subtitle">
                    Assessment performance alerts will appear once an academic term is active.
                  </span>
                </div>
              }
            />
          </div>
        ) : totalCount === 0 ? (
          <div className="dashboard-card-state-wrap">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="dashboard-positive-state">
                  <CheckCircleOutlined className="dashboard-positive-icon" />
                  <span className="dashboard-positive-title">
                    All subjects on track
                  </span>
                  <span className="dashboard-positive-subtitle">
                    Every subject is performing at or above the {threshold}% benchmark.
                  </span>
                </div>
              }
            />
          </div>
        ) : (
          <div className="attention-card-body">
            <div className="attention-items-list">
              {displayedPreview.map((item) => {
                const isEarlyData = item.lockedStageCount <= 2;
                const barPercent = Math.min(100, Math.max(0, Math.round(item.average)));
                const displayName = item.subjectName || "Subject";

                return (
                  <div
                    key={`${item.sectionId}-${item.subjectId}`}
                    className="attention-item-row"
                  >
                    <div className="attention-item-main">
                      <div className="attention-item-title-wrap">
                        <Link
                          to="/app/subjects"
                          className="attention-item-title-link"
                        >
                          {displayName}
                        </Link>
                        <span className="attention-subject-section-pill">
                          {item.label}
                        </span>
                        {isEarlyData && (
                          <Tag
                            bordered={false}
                            className="attention-status-tag attention-status-tag--early"
                          >
                            Early data ({item.lockedStageCount}{" "}
                            {item.lockedStageCount === 1 ? "stage" : "stages"})
                          </Tag>
                        )}
                      </div>

                      <div className="attention-progress-row">
                        <Progress
                          percent={barPercent}
                          showInfo={false}
                          strokeColor="var(--warning)"
                          trailColor="var(--border-color)"
                          strokeWidth={4}
                          strokeLinecap="round"
                          className="attention-progress-bar"
                        />
                        <span className="attention-meta-subtext">
                          {item.studentCount}{" "}
                          {item.studentCount === 1 ? "student" : "students"}
                        </span>
                      </div>
                    </div>

                    <div className="attention-item-figure">
                      <span className="attention-figure-value attention-figure-value--warning">
                        {formatAverage(item.average)}
                      </span>
                      <span className="attention-figure-unit">avg</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="attention-card-footer">
              <span className="attention-footer-footnote">
                Based on locked results · Target: {threshold}%
              </span>
              {totalCount > 4 && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => setDrawerOpen(true)}
                  className="attention-view-all-link"
                >
                  View all ({totalCount})
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* View All Drawer */}
      <Drawer
        title={
          <div className="dashboard-drawer-title">
            <span>Subjects Needing Support</span>
            <Tag bordered={false} className="dashboard-card-tag">
              &lt; {threshold}%
            </Tag>
          </div>
        }
        placement="right"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-items-list">
          {subjectsList.map((item) => {
            const isEarlyData = item.lockedStageCount <= 2;
            const barPercent = Math.min(100, Math.max(0, Math.round(item.average)));
            const displayName = item.subjectName || "Subject";

            return (
              <div
                key={`${item.sectionId}-${item.subjectId}`}
                className="drawer-item-card"
              >
                <div className="drawer-item-header">
                  <div className="drawer-item-title-group">
                    <Link to="/app/subjects" className="drawer-item-title">
                      {displayName}
                    </Link>
                    <span className="attention-subject-section-pill">
                      {item.label}
                    </span>
                    {isEarlyData && (
                      <Tag
                        bordered={false}
                        className="attention-status-tag attention-status-tag--early"
                      >
                        Early data ({item.lockedStageCount}{" "}
                        {item.lockedStageCount === 1 ? "stage" : "stages"})
                      </Tag>
                    )}
                  </div>
                  <div className="attention-item-figure">
                    <span className="attention-figure-value attention-figure-value--warning">
                      {formatAverage(item.average)}
                    </span>
                    <span className="attention-figure-unit">avg</span>
                  </div>
                </div>

                <div className="drawer-item-progress">
                  <Progress
                    percent={barPercent}
                    showInfo={false}
                    strokeColor="var(--warning)"
                    trailColor="var(--border-color)"
                    strokeWidth={5}
                    strokeLinecap="round"
                  />
                </div>

                <div className="drawer-item-detail">
                  <span className="drawer-detail-text">
                    Class: {item.label} ({item.grade})
                  </span>
                  <span className="drawer-detail-text">
                    Students: {item.studentCount} · Stages: {item.lockedStageCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>
    </>
  );
};
