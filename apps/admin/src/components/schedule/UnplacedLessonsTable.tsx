import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IScheduleUnplacedItem } from "@carecraft/types";
import { useScheduleNames } from "@/hooks/useScheduleNames";
import { describeUnplacedReasons } from "./timetableUtils";

const { Text } = Typography;

interface UnplacedLessonsTableProps {
  items: IScheduleUnplacedItem[];
  schoolYear?: string;
  size?: "small" | "middle";
}

/** Read-only table of unplaced lessons with resolved names and reasons. */
export function UnplacedLessonsTable({
  items,
  schoolYear,
  size = "small",
}: UnplacedLessonsTableProps) {
  const { gradeName, sectionName, subjectName, teacherName } =
    useScheduleNames(schoolYear);

  const columns: ColumnsType<IScheduleUnplacedItem> = [
    {
      title: "Grade",
      dataIndex: "gradeId",
      width: 110,
      render: (_: unknown, item: IScheduleUnplacedItem) => gradeName(item.gradeId),
    },
    {
      title: "Section",
      dataIndex: "sectionId",
      width: 130,
      render: (_: unknown, item: IScheduleUnplacedItem) =>
        sectionName(item.sectionId),
    },
    {
      title: "Subject",
      dataIndex: "subjectId",
      render: (_: unknown, item: IScheduleUnplacedItem) =>
        subjectName(item.subjectId),
    },
    {
      title: "Teacher",
      dataIndex: "teacherId",
      width: 170,
      render: (_: unknown, item: IScheduleUnplacedItem) =>
        teacherName(item.teacherId),
    },
    {
      title: "Periods",
      dataIndex: "periods",
      width: 80,
      align: "right",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      render: (_: unknown, item: IScheduleUnplacedItem) => (
        <Text type="secondary">{describeUnplacedReasons(item)}</Text>
      ),
    },
  ];

  return (
    <Table<IScheduleUnplacedItem>
      rowKey="lessonId"
      size={size}
      columns={columns}
      dataSource={items}
      pagination={false}
    />
  );
}
