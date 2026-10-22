import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type {
  DoublePeriodOption,
  IScheduleRequirementItem,
} from "@carecraft/types";
import { useGrades } from "@/hooks/useGrades";
import { useSubjects } from "@/hooks/useSubjects";
import { useScheduleSettings } from "@/hooks/useScheduleSettings";
import { useScheduleRequirements } from "@/hooks/useScheduleRequirements";
import {
  getRequirementItemId,
  getRequirementSubjectId,
  getRequirementSubjectName,
  requirementGradeLabel,
} from "./scheduleUtils";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";

const { Text } = Typography;

interface WeeklyPeriodsPanelProps {
  schoolYear: string;
  onGoToSettings: () => void;
}

interface EditableRow {
  key: string;
  itemId?: string;
  subjectId: string;
  subjectName: string;
  periodsPerWeek: number;
  doublePeriod: DoublePeriodOption;
}

const DOUBLE_PERIOD_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Allowed", value: "allowed" },
  { label: "Required", value: "required" },
];

export function WeeklyPeriodsPanel({
  schoolYear,
  onGoToSettings,
}: WeeklyPeriodsPanelProps) {
  const { grades } = useGrades();
  const { subjects } = useSubjects();
  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
    fetchError: settingsFetchError,
    refetch: refetchSettings,
  } = useScheduleSettings(schoolYear);

  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<EditableRow[]>([]);

  const {
    requirements,
    isLoading,
    isError,
    fetchError,
    refetch,
    save,
    removeItem,
    copy,
    isSaving,
    isCopying,
    isRemoving,
  } = useScheduleRequirements(schoolYear, gradeId);

  const [copyOpen, setCopyOpen] = useState(false);
  const [fromGradeId, setFromGradeId] = useState<string | undefined>(undefined);
  const [overwrite, setOverwrite] = useState(false);
  const [copySummary, setCopySummary] = useState<string | null>(null);

  // Reset the grade selection when the year changes.
  useEffect(() => {
    setGradeId(undefined);
    setRows([]);
    setCopySummary(null);
  }, [schoolYear]);

  const subjectNameById = (id: string) =>
    subjects.find((s) => s._id === id)?.name ?? "";

  // Seed editable rows from the server response.
  useEffect(() => {
    if (!requirements) {
      setRows([]);
      return;
    }
    setRows(
      requirements.items.map((item: IScheduleRequirementItem) => {
        const subjectId = getRequirementSubjectId(item);
        return {
          key: getRequirementItemId(item),
          itemId: getRequirementItemId(item),
          subjectId,
          // subjectName is null when the backend can't resolve it; fall back to
          // the existing subjects list by id.
          subjectName:
            getRequirementSubjectName(item) || subjectNameById(subjectId),
          periodsPerWeek: item.periodsPerWeek,
          doublePeriod: item.doublePeriod,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirements]);

  const total = rows.reduce((sum, r) => sum + (r.periodsPerWeek || 0), 0);
  const weeklySlotCount = requirements?.weeklySlotCount ?? 0;
  const remaining = weeklySlotCount - total;

  const status: "under" | "exact" | "over" =
    total < weeklySlotCount ? "under" : total > weeklySlotCount ? "over" : "exact";

  const runningTotals = useMemo(() => {
    let sum = 0;
    return rows.map((r) => {
      sum += r.periodsPerWeek || 0;
      return sum;
    });
  }, [rows]);

  const updateRow = (key: string, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const addSubject = (subjectId: string) => {
    const subject = subjects.find((s) => s._id === subjectId);
    setRows((prev) => [
      ...prev,
      {
        key: `new-${subjectId}-${Date.now()}`,
        subjectId,
        subjectName: subject?.name ?? subjectId,
        periodsPerWeek: 1,
        doublePeriod: "none",
      },
    ]);
  };

  const handleRemove = async (row: EditableRow) => {
    if (!row.itemId) {
      setRows((prev) => prev.filter((r) => r.key !== row.key));
      return;
    }
    try {
      await removeItem(row.itemId);
    } catch {
      // error toast is shown globally
    }
  };

  const handleSave = async () => {
    try {
      await save(
        rows.map((r) => ({
          subjectId: r.subjectId,
          periodsPerWeek: r.periodsPerWeek,
          doublePeriod: r.doublePeriod,
        }))
      );
    } catch {
      // error toast is shown globally
    }
  };

  const handleCopy = async () => {
    if (!gradeId || !fromGradeId) return;
    try {
      const result = await copy({ fromGradeId, toGradeId: gradeId, overwrite });
      setCopyOpen(false);
      setCopySummary(
        `Copied ${result?.copied ?? 0}, overwrote ${
          result?.overwritten ?? 0
        }, skipped ${result?.skipped ?? 0}.`
      );
      // Refetch the target grade so the real total and status appear.
      await refetch();
    } catch {
      // error toast is shown globally
    }
  };

  if (settingsError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load schedule settings"
        description={getErrorMessage(settingsFetchError)}
        action={
          <Button size="small" onClick={() => refetchSettings()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!settingsLoading && !settings) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Schedule settings are not configured yet"
        description={
          <span>
            The weekly slot count comes from the bell schedule for {schoolYear}.
            Set up the schedule first, then define weekly periods.
          </span>
        }
        action={
          <Button size="small" type="primary" onClick={onGoToSettings}>
            Go to Settings
          </Button>
        }
      />
    );
  }

  const gradeOptions = grades.map((g) => ({ label: g.level, value: g._id }));

  const usedSubjectIds = new Set(rows.map((r) => r.subjectId));
  const addableOptions = subjects
    .filter((s) => !usedSubjectIds.has(s._id))
    .map((s) => ({ label: s.name, value: s._id }));

  const statusTag =
    status === "under" ? (
      <Tag color="gold">Under by {remaining}</Tag>
    ) : status === "over" ? (
      <Tag color="red">Over by {Math.abs(remaining)}</Tag>
    ) : (
      <Tag color="green">Exact</Tag>
    );

  const columns = [
    {
      title: "Subject",
      dataIndex: "subjectName",
      render: (_: unknown, row: EditableRow) => (
        <Text strong>{row.subjectName || row.subjectId}</Text>
      ),
    },
    {
      title: "Periods / week",
      dataIndex: "periodsPerWeek",
      width: 150,
      render: (_: unknown, row: EditableRow) => (
        <InputNumber
          min={1}
          precision={0}
          value={row.periodsPerWeek}
          onChange={(value) =>
            updateRow(row.key, { periodsPerWeek: value ?? 1 })
          }
        />
      ),
    },
    {
      title: "Running total",
      key: "runningTotal",
      width: 130,
      render: (_: unknown, row: EditableRow) => {
        const index = rows.findIndex((r) => r.key === row.key);
        return <Text type="secondary">{runningTotals[index] ?? 0}</Text>;
      },
    },
    {
      title: "Double period",
      dataIndex: "doublePeriod",
      width: 170,
      render: (_: unknown, row: EditableRow) => (
        <Select<DoublePeriodOption>
          value={row.doublePeriod}
          style={{ width: 140 }}
          options={DOUBLE_PERIOD_OPTIONS}
          onChange={(value) => updateRow(row.key, { doublePeriod: value })}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      render: (_: unknown, row: EditableRow) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          loading={isRemoving}
          onClick={() => handleRemove(row)}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Card size="small">
        <Space wrap align="center">
          <Text strong>Grade</Text>
          <Select
            style={{ width: 200 }}
            placeholder="Select a grade"
            options={gradeOptions}
            value={gradeId}
            onChange={setGradeId}
            showSearch
            optionFilterProp="label"
          />
          {requirements && (
            <Text type="secondary">
              {requirementGradeLabel(requirements.grade) || requirements.gradeId}
            </Text>
          )}
        </Space>
      </Card>

      {copySummary && (
        <Alert
          type="success"
          showIcon
          closable
          onClose={() => setCopySummary(null)}
          message={copySummary}
        />
      )}

      {!gradeId ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Select a grade to view and edit its weekly periods."
          />
        </Card>
      ) : isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load weekly periods"
          description={getErrorMessage(fetchError)}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <Card
          title={
            <Space wrap>
              <span>Weekly periods</span>
              {statusTag}
              <Text type="secondary">
                {total} / {weeklySlotCount} periods
                {remaining > 0 ? ` · ${remaining} remaining` : ""}
              </Text>
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<CopyOutlined />}
                onClick={() => setCopyOpen(true)}
                disabled={!gradeId}
              >
                Copy from another grade
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isSaving}
              >
                Save
              </Button>
            </Space>
          }
        >
          <Space wrap style={{ marginBottom: 12 }}>
            <Select
              style={{ width: 240 }}
              placeholder="Add a subject"
              options={addableOptions}
              value={undefined}
              onChange={addSubject}
              showSearch
              optionFilterProp="label"
              disabled={addableOptions.length === 0}
            />
            <Text type="secondary">
              Over or under totals are allowed. They are shown, never blocked.
            </Text>
          </Space>

          <Table<EditableRow>
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No subjects yet. Add one above."
                />
              ),
            }}
          />
        </Card>
      )}

      <Modal
        title="Copy weekly periods from another grade"
        open={copyOpen}
        onOk={handleCopy}
        onCancel={() => setCopyOpen(false)}
        okText="Copy"
        confirmLoading={isCopying}
        okButtonProps={{ disabled: !fromGradeId }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong>Copy from</Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Select a grade"
              options={gradeOptions.filter((g) => g.value !== gradeId)}
              value={fromGradeId}
              onChange={setFromGradeId}
              showSearch
              optionFilterProp="label"
            />
          </div>
          <Checkbox
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
          >
            Overwrite subjects already defined for this grade
          </Checkbox>
          <Text type="secondary">
            Subjects that already exist are skipped unless overwrite is on.
          </Text>
        </Space>
      </Modal>
    </Space>
  );
}
