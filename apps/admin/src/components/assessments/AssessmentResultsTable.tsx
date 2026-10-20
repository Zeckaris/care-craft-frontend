/**
 * AssessmentResultsTable
 *
 * The read-only results sheet shown to admins and coordinators. It mirrors the
 * teacher class sheet: the first and last name columns stay pinned while one
 * column per assessment type scrolls horizontally, followed by Total and
 * Average.
 *
 * Marks are only visible for locked stages. A conducted but unlocked stage is
 * "in progress" and its cells show "_" (not zero); a not-conducted stage also
 * shows "_". A locked stage with no stored mark is a finalized zero.
 */
import { useMemo } from "react";
import { Button, Table, Tooltip, type TableColumnsType } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type {
  AssessmentStageState,
  ClassSheetColumn,
  ClassSheetStudent,
} from "@carecraft/types";
import {
  lockedMaxTotal,
  orderColumns,
  resultStageStateLabel,
} from "@carecraft/grades";

interface AssessmentResultsTableProps {
  columns: ClassSheetColumn[];
  students: ClassSheetStudent[];
  onReopen: (column: ClassSheetColumn) => void;
  reopeningTypeId?: string | null;
}

const MUTED = "#8c8c8c";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function formatAverage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

function stateColor(state: AssessmentStageState): string {
  switch (state) {
    case "locked":
      return "var(--text-dark)";
    case "conducted":
      return "var(--warning)";
    default:
      return MUTED;
  }
}

function ResultCell({
  column,
  student,
}: {
  column: ClassSheetColumn;
  student: ClassSheetStudent;
}) {
  const cell = student.scores[column.typeId];

  if (column.state !== "locked") {
    const pending = column.state === "conducted";
    return (
      <Tooltip
        title={pending ? "In progress. The subject teacher has not completed this assessment yet." : undefined}
      >
        <span style={{ color: pending ? "var(--warning)" : MUTED, fontWeight: pending ? 600 : 400 }}>
          _
        </span>
      </Tooltip>
    );
  }

  if (!cell?.entered || cell.score == null) {
    return <span style={{ color: MUTED, fontWeight: 500 }}>0</span>;
  }

  return (
    <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>{formatNumber(cell.score)}</span>
  );
}

export function AssessmentResultsTable({
  columns,
  students,
  onReopen,
  reopeningTypeId,
}: AssessmentResultsTableProps) {
  const ordered = orderColumns(columns);
  const lockedMax = lockedMaxTotal(columns);

  const studentIndexMap = useMemo(
    () => new Map(students.map((s, idx) => [s.studentId, idx + 1])),
    [students]
  );

  const tableColumns: TableColumnsType<ClassSheetStudent> = [
    {
      title: "#",
      key: "rowNumber",
      fixed: "left",
      width: 50,
      align: "center",
      render: (_value, record) => (
        <span
          style={{
            fontFamily: "monospace",
            fontVariantNumeric: "tabular-nums",
            color: MUTED,
          }}
        >
          {studentIndexMap.get(record.studentId) ?? "-"}
        </span>
      ),
    },
    {
      title: "First name",
      dataIndex: "firstName",
      key: "firstName",
      fixed: "left",
      width: 140,
      ellipsis: true,
    },
    {
      title: "Last name",
      dataIndex: "lastName",
      key: "lastName",
      fixed: "left",
      width: 140,
      ellipsis: true,
    },
    ...ordered.map<TableColumnsType<ClassSheetStudent>[number]>((column) => ({
      key: column.typeId,
      align: "center",
      width: 120,
      title: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700 }}>{column.name}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>
            out of {column.maxScore}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: stateColor(column.state) }}>
            {column.state === "locked" && <LockOutlined style={{ marginRight: 4 }} />}
            {resultStageStateLabel(column.state)}
          </div>
          {column.state === "locked" && (
            <Button
              type="link"
              size="small"
              style={{ padding: 0, height: "auto", fontSize: 11 }}
              loading={reopeningTypeId === column.typeId}
              onClick={() => onReopen(column)}
            >
              Reopen
            </Button>
          )}
        </div>
      ),
      render: (_value, student) => <ResultCell column={column} student={student} />,
    })),
    {
      key: "total",
      align: "center",
      width: 100,
      title: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700 }}>Total</div>
          {lockedMax > 0 && (
            <div style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>
              out of {lockedMax}
            </div>
          )}
        </div>
      ),
      render: (_value, student) =>
        student.total == null ? (
          <span style={{ color: MUTED, fontWeight: 500 }}>_</span>
        ) : (
          <span style={{ fontWeight: 600 }}>{formatNumber(student.total)}</span>
        ),
    },
    {
      key: "average",
      align: "center",
      width: 100,
      title: "Average",
      render: (_value, student) =>
        student.average == null ? (
          <span style={{ color: MUTED, fontWeight: 500 }}>_</span>
        ) : (
          <span style={{ fontWeight: 600 }}>{formatAverage(student.average)}</span>
        ),
    },
  ];

  return (
    <Table<ClassSheetStudent>
      rowKey="studentId"
      size="middle"
      columns={tableColumns}
      dataSource={students}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}
