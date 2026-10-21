import { Descriptions, Divider, Drawer, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { IObservation } from "@carecraft/types";

const { Paragraph, Text } = Typography;

interface ObservationDetailDrawerProps {
  open: boolean;
  observation: IObservation | null;
  termName: string;
  onClose: () => void;
}

function formatCalendarDate(value: string | null | undefined): string {
  if (!value) return "-";
  return dayjs(value.slice(0, 10)).format("MMM D, YYYY");
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "-";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

export function ObservationDetailDrawer({
  open,
  observation,
  termName,
  onClose,
}: ObservationDetailDrawerProps) {
  const studentName = observation?.studentId
    ? `${observation.studentId.firstName} ${observation.studentId.lastName}`
    : "Unknown student";
  const teacherName = observation?.teacherId
    ? `${observation.teacherId.firstName} ${observation.teacherId.lastName}`
    : "Unknown teacher";

  return (
    <Drawer
      title="Observation Details"
      width={640}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {observation && (
        <>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Student" span={2}>
              <Text strong>{studentName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Teacher" span={2}>
              {teacherName}
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
              {observation.subjectId ? (
                <Tag>{observation.subjectId.name}</Tag>
              ) : (
                <Text type="secondary">No subject</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {formatCalendarDate(observation.date)}
            </Descriptions.Item>
            <Descriptions.Item label="School year">
              {observation.schoolYear || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Term" span={2}>
              {observation.term ? termName : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Recorded" span={2}>
              {formatTimestamp(observation.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Last updated" span={2}>
              {formatTimestamp(observation.updatedAt)}
            </Descriptions.Item>
          </Descriptions>

          <Divider>Description</Divider>
          <Paragraph
            style={{
              marginBottom: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {observation.description || "No description provided."}
          </Paragraph>
        </>
      )}
    </Drawer>
  );
}
