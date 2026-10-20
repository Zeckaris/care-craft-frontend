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
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import type {
  AttendanceComplianceData,
  AttendanceComplianceDay,
  AttendanceComplianceSection,
  AttendanceCompliancePartialSection,
} from "@/hooks/useAttendanceCompliance";

const { Text } = Typography;

interface AttendanceComplianceCardProps {
  data: AttendanceComplianceData | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const formatFriendlyDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const parsed = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? dateStr : format(parsed, "EEE, MMM d");
};

export const AttendanceComplianceCard = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: AttendanceComplianceCardProps) => {
  const [activeTab, setActiveTab] = useState<"today" | "previous">("today");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeDayData: AttendanceComplianceDay | null =
    activeTab === "today"
      ? data?.today ?? null
      : data?.previousSchoolDay ?? null;

  const previousDateFormatted = formatFriendlyDate(
    data?.previousSchoolDay?.date ?? null
  );

  const notTakenList = activeDayData?.notTaken ?? [];
  const partiallyTakenList = activeDayData?.partiallyTaken ?? [];
  const totalCount = notTakenList.length + partiallyTakenList.length;

  const previewItems: Array<
    | { type: "partial"; item: AttendanceCompliancePartialSection }
    | { type: "notTaken"; item: AttendanceComplianceSection }
  > = [
    ...partiallyTakenList.map((item) => ({ type: "partial" as const, item })),
    ...notTakenList.map((item) => ({ type: "notTaken" as const, item })),
  ];

  const displayedPreview = previewItems.slice(0, 4);

  return (
    <>
      <Card
        className="dashboard-card attention-card"
        title={
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-left">
              <div className="dashboard-card-icon">
                <ClockCircleOutlined />
              </div>
              <div className="dashboard-card-title-group">
                <span className="dashboard-card-title">Attendance Not Taken</span>
                <span className="dashboard-card-subtitle">
                  {activeTab === "today"
                    ? "Pending roll call records"
                    : previousDateFormatted
                      ? `Unrecorded on ${previousDateFormatted}`
                      : "Previous school day records"}
                </span>
              </div>
            </div>
            <div className="dashboard-card-header-controls">
              <Segmented
                size="small"
                value={activeTab}
                onChange={(val) => setActiveTab(val as "today" | "previous")}
                options={[
                  { label: "Today", value: "today" },
                  {
                    label: previousDateFormatted
                      ? `Prev (${previousDateFormatted})`
                      : "Prev Day",
                    value: "previous",
                  },
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
                  Failed to load attendance compliance
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
        ) : !activeDayData || activeDayData.applicable === false ? (
          <div className="dashboard-card-state-wrap">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="dashboard-calm-state">
                  <span className="dashboard-calm-title">Not a school day</span>
                  <span className="dashboard-calm-subtitle">
                    {activeDayData?.reason ||
                      "Attendance recording is not scheduled for this date."}
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
                    Every section has taken attendance
                  </span>
                  <span className="dashboard-positive-subtitle">
                    {activeTab === "today"
                      ? "All scheduled classes have submitted their records today."
                      : "All classes recorded attendance for the previous school day."}
                  </span>
                </div>
              }
            />
          </div>
        ) : (
          <div className="attention-card-body">
            <div className="attention-items-list">
              {displayedPreview.map(({ type, item }) => (
                <div key={item.sectionId} className="attention-item-row">
                  <div className="attention-item-main">
                    <Link
                      to="/app/sections"
                      className="attention-item-title-link"
                    >
                      {item.label}
                    </Link>
                    <div className="attention-item-meta">
                      <UserOutlined className="attention-meta-icon" />
                      <span className="attention-meta-text">
                        {item.homeroomTeacher?.name
                          ? `Teacher: ${item.homeroomTeacher.name}`
                          : "No homeroom teacher assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="attention-item-status">
                    {type === "partial" ? (
                      <Tag
                        bordered={false}
                        className="attention-status-tag attention-status-tag--partial"
                      >
                        {item.marked} of {item.total} marked
                      </Tag>
                    ) : activeTab === "today" ? (
                      <Tag
                        bordered={false}
                        className="attention-status-tag attention-status-tag--pending"
                      >
                        Not taken yet
                      </Tag>
                    ) : (
                      <Tag
                        bordered={false}
                        className="attention-status-tag attention-status-tag--missed"
                      >
                        Unrecorded
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="attention-card-footer">
              <span className="attention-footer-count">
                {totalCount} {totalCount === 1 ? "section" : "sections"} pending
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
            <span>Attendance Not Taken</span>
            <Tag bordered={false} className="dashboard-card-tag">
              {activeTab === "today"
                ? "Today"
                : previousDateFormatted || "Previous Day"}
            </Tag>
          </div>
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-items-list">
          {previewItems.map(({ type, item }) => (
            <div key={item.sectionId} className="drawer-item-card">
              <div className="drawer-item-header">
                <Link to="/app/sections" className="drawer-item-title">
                  {item.label}
                </Link>
                {type === "partial" ? (
                  <Tag
                    bordered={false}
                    className="attention-status-tag attention-status-tag--partial"
                  >
                    {item.marked} of {item.total} marked
                  </Tag>
                ) : activeTab === "today" ? (
                  <Tag
                    bordered={false}
                    className="attention-status-tag attention-status-tag--pending"
                  >
                    Not taken yet
                  </Tag>
                ) : (
                  <Tag
                    bordered={false}
                    className="attention-status-tag attention-status-tag--missed"
                  >
                    Unrecorded
                  </Tag>
                )}
              </div>
              <div className="drawer-item-detail">
                <span className="drawer-detail-text">
                  Homeroom: {item.homeroomTeacher?.name || "Unassigned"}
                </span>
                <span className="drawer-detail-text">Grade: {item.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
