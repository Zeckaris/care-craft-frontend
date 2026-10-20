import { Card, Empty, Progress, Skeleton, Typography } from "antd";
import { format } from "date-fns";
import type { AttendanceSnapshot } from "@/hooks/useAttendanceSnapshot";

const { Text } = Typography;

interface AttendanceSnapshotCardProps {
  snapshot: AttendanceSnapshot | null;
  isLoading?: boolean;
}

const formatSnapshotDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : format(parsed, "EEE, MMM d");
};

export const AttendanceSnapshotCard = ({
  snapshot,
  isLoading = false,
}: AttendanceSnapshotCardProps) => {
  const dateLabel = snapshot?.date ? formatSnapshotDate(snapshot.date) : null;
  const markedPercent =
    snapshot && snapshot.expected > 0
      ? Math.min(100, Math.round((snapshot.marked / snapshot.expected) * 100))
      : 0;

  return (
    <Card
      className="snapshot-card"
      title={
        <div className="snapshot-title">
          <span>Attendance</span>
          {dateLabel && (
            <span className="snapshot-subtitle">{dateLabel}</span>
          )}
        </div>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : !snapshot ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Attendance data unavailable"
        />
      ) : snapshot.date === null ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No previous school day yet"
        />
      ) : (
        <div className="snapshot-content">
          <div className="snapshot-stats">
            <div className="snapshot-stat">
              <div className="snapshot-stat-value snapshot-stat-value--danger">
                {snapshot.absent}
              </div>
              <Text type="secondary">Absent</Text>
            </div>
            <div className="snapshot-stat">
              <div className="snapshot-stat-value snapshot-stat-value--warning">
                {snapshot.late}
              </div>
              <Text type="secondary">Late</Text>
            </div>
          </div>

          <div className="snapshot-chips">
            <span className="snapshot-chip">
              <span className="snapshot-chip-label">Present</span>
              <span className="snapshot-chip-value">{snapshot.present}</span>
            </span>
            <span className="snapshot-chip">
              <span className="snapshot-chip-label">Excused</span>
              <span className="snapshot-chip-value">{snapshot.excused}</span>
            </span>
          </div>

          <div className="snapshot-progress">
            <Text type="secondary" className="snapshot-progress-label">
              {snapshot.marked} of {snapshot.expected} students marked
            </Text>
            <Progress
              percent={markedPercent}
              showInfo={false}
              strokeColor="var(--primary)"
              trailColor="var(--border-color)"
              strokeWidth={5}
            />
          </div>

          <Text type="secondary" className="snapshot-footnote">
            {snapshot.sectionsWithRecords} of {snapshot.totalSections} sections
            recorded
          </Text>
        </div>
      )}
    </Card>
  );
};
