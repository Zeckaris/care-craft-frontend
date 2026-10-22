import { useState } from "react";
import { Alert, Button, Card, Skeleton, Space, Tag, Typography } from "antd";
import { useScheduleDetail } from "@/hooks/useScheduleDetail";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";
import { GeneratePanel } from "./GeneratePanel";
import { SchedulesList } from "./SchedulesList";
import { ScheduleSummary } from "./ScheduleSummary";
import { ScheduleWorkspace } from "./ScheduleWorkspace";
import { ScheduleActions } from "./ScheduleActions";
import { DriftDrawer } from "./DriftDrawer";

const { Text } = Typography;

interface TimetablePanelProps {
  schoolYear: string;
  /** False while the Timetable tab is hidden; stops generation polling. */
  active: boolean;
  onGoToReadiness: () => void;
}

export function TimetablePanel({
  schoolYear,
  active,
  onGoToReadiness,
}: TimetablePanelProps) {
  /**
   * `undefined` shows the current draft for the year (GET /draft). A concrete
   * id opens that stored schedule (GET /schedules/:id), including published.
   */
  const [openScheduleId, setOpenScheduleId] = useState<string | undefined>(
    undefined
  );
  const [driftOpen, setDriftOpen] = useState(false);

  const {
    schedule,
    entries,
    isLoading,
    isError,
    isNotFound,
    fetchError,
    refetch,
  } = useScheduleDetail({ schoolYear, scheduleId: openScheduleId });

  const openSchedule = (scheduleId: string) => {
    setDriftOpen(false);
    setOpenScheduleId(scheduleId);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <GeneratePanel
        schoolYear={schoolYear}
        active={active}
        onCompleted={openSchedule}
        onGoToReadiness={onGoToReadiness}
      />

      <Card size="small" title="Schedules">
        <SchedulesList
          schoolYear={schoolYear}
          openScheduleId={openScheduleId}
          onOpen={openSchedule}
          onDiscarded={() => {
            setOpenScheduleId(undefined);
            refetch();
          }}
          onCloned={openSchedule}
        />
      </Card>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : isError && !isNotFound ? (
        <Alert
          type="error"
          showIcon
          message="Could not load the schedule"
          description={getErrorMessage(fetchError)}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : isNotFound || !schedule ? (
        <Alert
          type="info"
          showIcon
          message={
            openScheduleId
              ? "That schedule is no longer available"
              : "No draft schedule yet"
          }
          description={
            openScheduleId
              ? "It may have been discarded. Pick another schedule above."
              : `Generate one above, or open a stored schedule from the list.`
          }
          action={
            openScheduleId ? (
              <Button size="small" onClick={() => setOpenScheduleId(undefined)}>
                Back to draft
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {schedule.status === "published" && (
            <Alert
              type="success"
              showIcon
              message={
                <Space wrap>
                  <span>This is the published timetable</span>
                  <Tag color="green">Published</Tag>
                </Space>
              }
              description={`Published for ${schedule.schoolYear}${
                schedule.publishedAt
                  ? ` on ${new Date(schedule.publishedAt).toLocaleString()}`
                  : ""
              }.`}
            />
          )}

          <ScheduleActions
            schedule={schedule}
            onPublished={() => refetch()}
            onCloned={(result) => openSchedule(result.scheduleId)}
            onReload={() => refetch()}
            onGoToReadiness={onGoToReadiness}
            onViewDrift={() => setDriftOpen(true)}
          />

          <ScheduleSummary
            schedule={schedule}
            onViewDrift={() => setDriftOpen(true)}
          />
          <ScheduleWorkspace schedule={schedule} entries={entries} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Read-only view. Editing, locking, moving and printing arrive in a
            later phase.
          </Text>

          <DriftDrawer
            scheduleId={schedule.scheduleId}
            open={driftOpen}
            onClose={() => setDriftOpen(false)}
          />
        </Space>
      )}
    </Space>
  );
}
