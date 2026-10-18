import { Button, Card, Space, Table, Tag, Typography } from "antd";
import { TableOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ISchedule, IScheduleEntry } from "@carecraft/types";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { weeklySlotCount } from "./timetableUtils";

const { Text } = Typography;

interface SchoolOverviewProps {
  schedule: ISchedule;
  entries: IScheduleEntry[];
  onOpenSection: (gradeId: string, sectionId: string) => void;
}

interface OverviewRow {
  key: string;
  gradeId: string;
  gradeLevel: string;
  sectionId: string;
  sectionName: string;
  placed: number;
  weeklySlots: number;
  unplaced: number;
}

export function SchoolOverview({
  schedule,
  entries,
  onOpenSection,
}: SchoolOverviewProps) {
  const { grades } = useGrades();
  const { sections, isLoading } = useSections({
    schoolYear: schedule.schoolYear,
    pageSize: 1000,
  });

  const slots = weeklySlotCount(schedule.settingsSnapshot);

  const placedBySection = new Map<string, number>();
  for (const entry of entries) {
    placedBySection.set(
      entry.sectionId,
      (placedBySection.get(entry.sectionId) ?? 0) + 1
    );
  }

  const unplacedBySection = new Map<string, number>();
  for (const item of schedule.unplaced ?? []) {
    unplacedBySection.set(
      item.sectionId,
      (unplacedBySection.get(item.sectionId) ?? 0) + item.periods
    );
  }

  const gradeLevel = (gradeId: string) =>
    grades.find((g) => g._id === gradeId)?.level ?? "-";

  const rows: OverviewRow[] = sections
    .map((section) => ({
      key: section._id,
      gradeId: section.gradeId?._id ?? "",
      gradeLevel: section.gradeId?.level ?? gradeLevel(section.gradeId?._id ?? ""),
      sectionId: section._id,
      sectionName: section.name,
      placed: placedBySection.get(section._id) ?? 0,
      weeklySlots: slots,
      unplaced: unplacedBySection.get(section._id) ?? 0,
    }))
    .sort(
      (a, b) =>
        a.gradeLevel.localeCompare(b.gradeLevel) ||
        a.sectionName.localeCompare(b.sectionName)
    );

  const columns: ColumnsType<OverviewRow> = [
    {
      title: "Grade",
      dataIndex: "gradeLevel",
      width: 140,
      render: (_: unknown, row: OverviewRow) => (
        <Text strong>{row.gradeLevel || "-"}</Text>
      ),
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      width: 160,
    },
    {
      title: "Placed",
      dataIndex: "placed",
      width: 110,
      align: "right",
      render: (_: unknown, row: OverviewRow) => (
        <Tag color={row.placed >= row.weeklySlots ? "green" : "gold"}>
          {row.placed} / {row.weeklySlots}
        </Tag>
      ),
    },
    {
      title: "Unplaced",
      dataIndex: "unplaced",
      width: 110,
      align: "right",
      render: (_: unknown, row: OverviewRow) =>
        row.unplaced > 0 ? (
          <Tag color="red">{row.unplaced}</Tag>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: "",
      key: "action",
      width: 130,
      render: (_: unknown, row: OverviewRow) => (
        <Button
          size="small"
          icon={<TableOutlined />}
          onClick={() => onOpenSection(row.gradeId, row.sectionId)}
        >
          View grid
        </Button>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>School overview</span>
          <Text type="secondary">Weekly slots per section: {slots}</Text>
        </Space>
      }
    >
      <Table<OverviewRow>
        rowKey="key"
        size="small"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: "No sections found for this school year." }}
      />
    </Card>
  );
}
