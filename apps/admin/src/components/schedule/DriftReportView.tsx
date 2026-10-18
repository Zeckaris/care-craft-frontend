import {
  Alert,
  Card,
  Descriptions,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  IDriftEntry,
  IDriftLesson,
  IScheduleDriftReport,
} from "@carecraft/types";
import { useScheduleNames } from "@/hooks/useScheduleNames";
import { dayLabel } from "./scheduleUtils";
import {
  DRIFT_COUNT_FIELDS,
  describeDriftEntryReason,
  describeDriftLessonReason,
} from "./timetableUtils";

const { Text } = Typography;

interface DriftReportViewProps {
  drift: IScheduleDriftReport;
}

/** Read-only drift report with resolved names. Shared by the drawer and modal. */
export function DriftReportView({ drift }: DriftReportViewProps) {
  const {
    gradeNameForSection,
    sectionName,
    subjectName,
    teacherName,
  } = useScheduleNames(drift.schoolYear);

  const counts = drift.counts;
  const countValue = (key: string): number =>
    (counts as unknown as Record<string, number>)[key] ?? 0;

  const entryColumns: ColumnsType<IDriftEntry> = [
    {
      title: "Grade",
      key: "grade",
      width: 100,
      render: (_: unknown, entry: IDriftEntry) =>
        gradeNameForSection(entry.sectionId) || "-",
    },
    {
      title: "Section",
      key: "section",
      width: 120,
      render: (_: unknown, entry: IDriftEntry) => sectionName(entry.sectionId),
    },
    {
      title: "Subject",
      key: "subject",
      render: (_: unknown, entry: IDriftEntry) => subjectName(entry.subjectId),
    },
    {
      title: "Teacher",
      key: "teacher",
      width: 160,
      render: (_: unknown, entry: IDriftEntry) => teacherName(entry.teacherId),
    },
    {
      title: "Day",
      key: "day",
      width: 100,
      render: (_: unknown, entry: IDriftEntry) => dayLabel(entry.day),
    },
    {
      title: "Period",
      dataIndex: "period",
      width: 70,
      align: "right",
    },
    {
      title: "Reasons",
      key: "reasons",
      render: (_: unknown, entry: IDriftEntry) =>
        entry.reasons?.length ? (
          <Space direction="vertical" size={0}>
            {entry.reasons.map((reason) => (
              <Text key={reason} type="secondary">
                {describeDriftEntryReason(reason)}
              </Text>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ];

  const lessonColumns: ColumnsType<IDriftLesson> = [
    {
      title: "Grade",
      key: "grade",
      width: 100,
      render: (_: unknown, lesson: IDriftLesson) =>
        gradeNameForSection(lesson.sectionId) || "-",
    },
    {
      title: "Section",
      key: "section",
      width: 120,
      render: (_: unknown, lesson: IDriftLesson) => sectionName(lesson.sectionId),
    },
    {
      title: "Subject",
      key: "subject",
      render: (_: unknown, lesson: IDriftLesson) => subjectName(lesson.subjectId),
    },
    {
      title: "Required",
      dataIndex: "required",
      width: 90,
      align: "right",
    },
    {
      title: "Placed",
      dataIndex: "placed",
      width: 80,
      align: "right",
    },
    {
      title: "Reason",
      key: "reason",
      render: (_: unknown, lesson: IDriftLesson) => (
        <Text type="secondary">
          {describeDriftLessonReason(lesson.reason)}
        </Text>
      ),
    },
  ];

  const settings = drift.settings;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Alert
        type={drift.drifted ? "warning" : "success"}
        showIcon
        message={drift.drifted ? "Data has drifted" : "No drift detected"}
        description={
          drift.drifted
            ? "The underlying data changed since this schedule was generated."
            : "This schedule still matches the current data."
        }
      />

      <Card size="small" title="Settings">
        {settings?.changed ? (
          <Space wrap>
            {settings.bellScheduleChanged && (
              <Tag color="orange">Bell schedule changed</Tag>
            )}
            {settings.enabledDaysChanged && (
              <Tag color="orange">Enabled days changed</Tag>
            )}
          </Space>
        ) : (
          <Text type="secondary">Settings are unchanged.</Text>
        )}
      </Card>

      <Card size="small" title="Counts">
        <Space size="large" wrap>
          {DRIFT_COUNT_FIELDS.map(([key, label]) => (
            <Statistic
              key={key}
              title={label}
              value={countValue(key)}
              valueStyle={
                countValue(key) > 0 ? { color: "#cf1322" } : undefined
              }
            />
          ))}
        </Space>
      </Card>

      <Card size="small" title={`Affected entries (${drift.entries?.length ?? 0})`}>
        {drift.entries?.length ? (
          <Table<IDriftEntry>
            rowKey="entryId"
            size="small"
            columns={entryColumns}
            dataSource={drift.entries}
            pagination={false}
          />
        ) : (
          <Text type="secondary">No entries are affected.</Text>
        )}
      </Card>

      <Card
        size="small"
        title={`Weekly counts over or short (${drift.lessons?.length ?? 0})`}
      >
        {drift.lessons?.length ? (
          <Table<IDriftLesson>
            rowKey="lessonId"
            size="small"
            columns={lessonColumns}
            dataSource={drift.lessons}
            pagination={false}
          />
        ) : (
          <Text type="secondary">No weekly-count mismatches.</Text>
        )}
      </Card>

      <Descriptions size="small" column={1}>
        <Descriptions.Item label="Generated fingerprint">
          <Text code>{drift.generatedFingerprint || "-"}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Current fingerprint">
          <Text code>{drift.currentFingerprint || "-"}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Space>
  );
}
