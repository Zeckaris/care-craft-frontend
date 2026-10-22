import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Drawer,
  Empty,
  Segmented,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import type {
  ChronicAbsenteesData,
  ChronicAbsenteeStudent,
} from "@/hooks/useChronicAbsentees";

const { Text } = Typography;

interface ChronicAbsenteesCardProps {
  data: ChronicAbsenteesData | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const formatShortAbsenceDates = (dates: string[]) => {
  if (!dates || dates.length === 0) return "No dates recorded";
  const formatted = dates.map((d) => {
    const parsed = new Date(`${d}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? d : format(parsed, "MMM d");
  });
  if (formatted.length <= 3) return formatted.join(", ");
  return `${formatted.slice(0, 3).join(", ")} +${formatted.length - 3} more`;
};

export const ChronicAbsenteesCard = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: ChronicAbsenteesCardProps) => {
  const [activeWeek, setActiveWeek] = useState<"current" | "previous">("current");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeWeekData =
    activeWeek === "current" ? data?.currentWeek : data?.previousWeek;

  const absenteesList: ChronicAbsenteeStudent[] =
    activeWeekData?.absentees ?? [];
  const totalCount = absenteesList.length;
  const displayedPreview = absenteesList.slice(0, 4);
  const minDays = data?.minimumAbsentDays ?? 3;

  return (
    <>
      <Card
        className="dashboard-card attention-card"
        title={
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-left">
              <div className="dashboard-card-icon">
                <UserDeleteOutlined />
              </div>
              <div className="dashboard-card-title-group">
                <span className="dashboard-card-title">Frequent Absentees</span>
                <span className="dashboard-card-subtitle">
                  {activeWeek === "current"
                    ? "Absences recorded this week"
                    : "Absences recorded last week"}
                </span>
              </div>
            </div>
            <div className="dashboard-card-header-controls">
              <Segmented
                size="small"
                value={activeWeek}
                onChange={(val) => setActiveWeek(val as "current" | "previous")}
                options={[
                  { label: "This Week", value: "current" },
                  { label: "Last Week", value: "previous" },
                ]}
                className="dashboard-segmented"
              />
            </div>
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
                  Failed to load absentee data
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
        ) : totalCount === 0 ? (
          <div className="dashboard-card-state-wrap">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="dashboard-positive-state">
                  <CheckCircleOutlined className="dashboard-positive-icon" />
                  <span className="dashboard-positive-title">
                    No frequent absences
                  </span>
                  <span className="dashboard-positive-subtitle">
                    No students have reached {minDays} or more absent days{" "}
                    {activeWeek === "current" ? "this week" : "last week"}.
                  </span>
                </div>
              }
            />
          </div>
        ) : (
          <div className="attention-card-body">
            <div className="attention-items-list">
              {displayedPreview.map((item) => (
                <div key={item.studentId} className="attention-item-row">
                  <div className="attention-item-main">
                    <div className="attention-item-title-wrap">
                      <Link
                        to="/app/students"
                        className="attention-item-title-link"
                      >
                        {item.studentName}
                      </Link>
                      {item.appearsInBothWeeks && (
                        <Tag
                          bordered={false}
                          className="attention-status-tag attention-status-tag--consecutive"
                        >
                          Both weeks
                        </Tag>
                      )}
                    </div>
                    <div className="attention-item-meta">
                      <span className="attention-meta-text">
                        {item.sectionLabel ||
                          (item.grade ? `Grade ${item.grade}` : "No section")}
                      </span>
                      <span className="attention-meta-separator">·</span>
                      <span className="attention-meta-dates">
                        {formatShortAbsenceDates(item.absenceDates)}
                      </span>
                    </div>
                  </div>

                  <div className="attention-item-figure">
                    <span className="attention-figure-value">
                      {item.absentDayCount}
                    </span>
                    <span className="attention-figure-unit">
                      {item.absentDayCount === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="attention-card-footer">
              <span className="attention-footer-footnote">
                Counts school days absent (minimum {minDays} days)
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
            <span>Frequent Absentees</span>
            <Tag bordered={false} className="dashboard-card-tag">
              {activeWeek === "current" ? "This Week" : "Last Week"}
            </Tag>
          </div>
        }
        placement="right"
        width={500}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-items-list">
          {absenteesList.map((item) => (
            <div key={item.studentId} className="drawer-item-card">
              <div className="drawer-item-header">
                <div className="drawer-item-title-group">
                  <Link to="/app/students" className="drawer-item-title">
                    {item.studentName}
                  </Link>
                  {item.appearsInBothWeeks && (
                    <Tag
                      bordered={false}
                      className="attention-status-tag attention-status-tag--consecutive"
                    >
                      Both weeks
                    </Tag>
                  )}
                </div>
                <div className="attention-item-figure">
                  <span className="attention-figure-value">
                    {item.absentDayCount}
                  </span>
                  <span className="attention-figure-unit">
                    {item.absentDayCount === 1 ? "day absent" : "days absent"}
                  </span>
                </div>
              </div>
              <div className="drawer-item-detail">
                <span className="drawer-detail-text">
                  Class: {item.sectionLabel || "No section assigned"}
                </span>
                <span className="drawer-detail-text">
                  Dates: {item.absenceDates.join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
