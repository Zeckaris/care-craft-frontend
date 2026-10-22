import { Alert, Modal, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { DeleteOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ISchedule, ScheduleStatus } from "@carecraft/types";
import { useSchedules } from "@/hooks/useSchedules";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";
import { CloneDraftButton } from "./CloneDraftButton";

const { Text } = Typography;

interface SchedulesListProps {
  schoolYear: string;
  openScheduleId?: string;
  onOpen: (scheduleId: string) => void;
  /** Called after a draft is discarded so the owner can clear stale state. */
  onDiscarded?: (scheduleId: string) => void;
  /** Called after a clone creates a new draft so the owner can open it. */
  onCloned?: (scheduleId: string) => void;
}

const STATUS_COLORS: Record<ScheduleStatus, string> = {
  draft: "blue",
  published: "green",
  archived: "default",
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const formatDateTime = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleString() : "-";

export function SchedulesList({
  schoolYear,
  openScheduleId,
  onOpen,
  onDiscarded,
  onCloned,
}: SchedulesListProps) {
  const {
    schedules,
    isLoading,
    isError,
    fetchError,
    refetch,
    discard,
    isDiscarding,
  } = useSchedules(schoolYear);

  const published = schedules.find((s) => s.status === "published");

  const handleDiscard = (schedule: ISchedule) => {
    Modal.confirm({
      title: "Discard this draft?",
      content:
        "The draft and all of its placed lessons are permanently deleted. This cannot be undone.",
      okText: "Discard",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await discard(schedule.scheduleId);
          message.success(
            `Draft discarded (${result?.deletedEntries ?? 0} entries removed).`
          );
          onDiscarded?.(schedule.scheduleId);
          await refetch();
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });
  };

  const columns: ColumnsType<ISchedule> = [
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      render: (_: unknown, schedule: ISchedule) => (
        <Space wrap size={4}>
          <Tag color={STATUS_COLORS[schedule.status] ?? "default"}>
            {STATUS_LABELS[schedule.status] ?? schedule.status}
          </Tag>
          {schedule.status === "published" && (
            <Tag color="green">Published</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Generated",
      dataIndex: "generatedAt",
      width: 190,
      render: (_: unknown, schedule: ISchedule) =>
        formatDateTime(schedule.generatedAt ?? schedule.createdAt),
    },
    {
      title: "Entries",
      dataIndex: "entryCount",
      width: 90,
      align: "right",
    },
    {
      title: "Unplaced",
      key: "unplaced",
      width: 100,
      align: "right",
      render: (_: unknown, schedule: ISchedule) =>
        schedule.stats?.unplacedCount ?? schedule.unplaced?.length ?? 0,
    },
    {
      title: "Drift",
      dataIndex: "drifted",
      width: 110,
      render: (_: unknown, schedule: ISchedule) =>
        schedule.drifted === true ? (
          <Tooltip title="The underlying data changed since this schedule was generated.">
            <Tag color="orange">Drifted</Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Version",
      dataIndex: "version",
      width: 90,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_: unknown, schedule: ISchedule) => (
        <Space wrap>
          <a onClick={() => onOpen(schedule.scheduleId)}>
            <FolderOpenOutlined /> Open
          </a>
          {(schedule.status === "published" ||
            schedule.status === "archived") && (
            <CloneDraftButton
              schedule={schedule}
              link
              onCloned={(result) => onCloned?.(result.scheduleId)}
            />
          )}
          {schedule.status === "draft" && (
            <a
              onClick={() => !isDiscarding && handleDiscard(schedule)}
              style={{ color: "#ff4d4f" }}
            >
              <DeleteOutlined /> Discard
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {published && (
        <Alert
          type="success"
          showIcon
          message={`Currently published for ${schoolYear}`}
          description={`Published ${
            published.publishedAt
              ? new Date(published.publishedAt).toLocaleString()
              : "-"
          } · ${published.entryCount} entries${
            published.drifted === true ? " · drifted" : ""
          }`}
          action={
            <a onClick={() => onOpen(published.scheduleId)}>
              Open published schedule
            </a>
          }
        />
      )}

      <Table<ISchedule>
        rowKey="scheduleId"
        size="small"
        columns={columns}
        dataSource={schedules}
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: "No schedules for this school year yet." }}
        rowClassName={(schedule) =>
          schedule.scheduleId === openScheduleId ? "ant-table-row-selected" : ""
        }
        expandable={{
          expandedRowRender: (schedule) => (
            <Text type="secondary">
              Fingerprint: {schedule.fingerprint || "-"}
              {schedule.stats?.timedOut ? " · Time limit was hit" : ""}
              {schedule.stats?.hardViolations
                ? ` · ${schedule.stats.hardViolations} hard violation(s)`
                : ""}
            </Text>
          ),
        }}
        onRow={() => ({
          style: { cursor: "default" },
        })}
        footer={() =>
          isError ? (
            <Text type="danger">
              Could not load schedules: {getErrorMessage(fetchError)}
            </Text>
          ) : null
        }
      />
    </Space>
  );
}
