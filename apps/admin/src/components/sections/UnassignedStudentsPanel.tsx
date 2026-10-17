import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";
import { useGrades } from "@/hooks/useGrades";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import { useUnassignedEnrollments } from "@/hooks/useUnassignedEnrollments";
import { useSections } from "@/hooks/useSections";
import { useSectionMoves } from "@/hooks/useSectionMoves";
import { useSectionRoster } from "@/hooks/useSectionRoster";
import type {
  IBulkMoveSectionResult,
  IUnassignedEnrollment,
} from "@carecraft/types";
import { GenderTag, StudentCell } from "./studentAssignmentHelpers";
import {
  type GenerationInfo,
  getErrorMessage,
  sameAcademicYear,
  studentFullName,
} from "./studentAssignmentUtils";

const { Text } = Typography;

interface UnassignedStudentsPanelProps {
  /** Details of the last real generation run, for a non-blocking capacity hint. */
  generationInfo?: GenerationInfo | null;
}

export function UnassignedStudentsPanel({
  generationInfo,
}: UnassignedStudentsPanelProps) {
  const { grades } = useGrades();
  const { currentCalendar } = useAcademicCalendars();

  const [gradeId, setGradeId] = useState<string | undefined>();
  const [schoolYear, setSchoolYear] = useState<string | undefined>();

  // Default the school year to the current academic calendar (editable).
  useEffect(() => {
    if (currentCalendar && !schoolYear) {
      setSchoolYear(currentCalendar.academicYear);
    }
  }, [currentCalendar, schoolYear]);

  const {
    enrollments,
    count,
    isLoading,
    isError,
    fetchError,
    refetch,
    enabled,
  } = useUnassignedEnrollments({ gradeId, schoolYear });

  const { sections, isLoading: sectionsLoading } = useSections({
    gradeId,
    schoolYear,
    isActive: true,
    pageSize: 500,
  });

  const { bulkMove, moveOne, isMoving } = useSectionMoves();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [targetSectionId, setTargetSectionId] = useState<string | undefined>();

  // Target roster count powers the non-blocking capacity hint.
  const { enrollments: targetRoster } = useSectionRoster(targetSectionId);

  useEffect(() => {
    setPage(1);
  }, [gradeId, schoolYear, searchText]);

  useEffect(() => {
    setSelectedRowKeys([]);
    setTargetSectionId(undefined);
  }, [gradeId, schoolYear]);

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return enrollments;
    return enrollments.filter((e) =>
      studentFullName(e.studentId).toLowerCase().includes(term)
    );
  }, [enrollments, searchText]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const targetSection = sections.find((s) => s._id === targetSectionId);
  const matchesGeneration =
    !!generationInfo &&
    generationInfo.gradeId === gradeId &&
    sameAcademicYear(generationInfo.schoolYear, schoolYear);
  const projectedCount = targetRoster.length + selectedRowKeys.length;
  const showCapacityHint =
    matchesGeneration && !!targetSectionId && projectedCount > generationInfo!.maxSize;

  const showPartialResult = (result: IBulkMoveSectionResult) => {
    const shown = result.errors.slice(0, 10);
    Modal.warning({
      title: `Moved ${result.successCount} of ${result.total} student(s)`,
      width: 560,
      content: (
        <div>
          <p>{result.failedCount} student(s) could not be moved.</p>
          {shown.length > 0 && (
            <>
              <p style={{ marginBottom: 4 }}>
                <Text strong>Errors (first {shown.length}):</Text>
              </p>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {shown.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    });
  };

  const applyResult = (result: IBulkMoveSectionResult) => {
    if (result.failedCount > 0) {
      showPartialResult(result);
    } else {
      message.success(`Moved ${result.successCount} student(s)`);
    }
    setSelectedRowKeys([]);
  };

  const handleBulkAssign = () => {
    if (!targetSectionId || selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: `Assign ${selectedRowKeys.length} student(s) to ${
        targetSection?.name ?? "this section"
      }?`,
      content: "Students will be moved into the selected section.",
      okText: "Assign",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await bulkMove(
            selectedRowKeys.map(String),
            targetSectionId
          );
          applyResult(result);
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });
  };

  const handleAssignOne = async (enrollmentId: string, name: string) => {
    if (!targetSectionId) {
      message.info("Choose a target section first");
      return;
    }
    try {
      await moveOne(enrollmentId, targetSectionId);
      message.success(`Assigned ${name}`);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const gradeOptions = grades.map((g) => ({ label: g.level, value: g._id }));
  const sectionOptions = sections.map((s) => ({
    label: s.name,
    value: s._id,
  }));

  return (
    <Card
      title={
        <Space>
          <UserAddOutlined style={{ color: "#52c41a" }} />
          <span>Unassigned Students</span>
          {enabled && <Text type="secondary">({count})</Text>}
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
          disabled={!enabled}
        >
          Refresh
        </Button>
      }
    >
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Select grade"
          style={{ width: 180 }}
          value={gradeId}
          onChange={setGradeId}
          options={gradeOptions}
          showSearch
          optionFilterProp="label"
          allowClear
        />
        <Input
          placeholder="School Year (e.g. 2024-2025)"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value || undefined)}
          style={{ width: 200 }}
          allowClear
        />
      </Space>

      {!enabled ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select a grade and school year to see unassigned students."
        />
      ) : (
        <>
          {isError && (
            <Alert
              type="error"
              showIcon
              message="Failed to load unassigned students"
              description={getErrorMessage(fetchError)}
              style={{ marginBottom: 16 }}
            />
          )}

          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="Target section"
              style={{ width: 200 }}
              value={targetSectionId}
              onChange={setTargetSectionId}
              options={sectionOptions}
              loading={sectionsLoading}
              allowClear
              showSearch
              optionFilterProp="label"
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              disabled={selectedRowKeys.length === 0 || !targetSectionId}
              loading={isMoving}
              onClick={handleBulkAssign}
            >
              Assign Selected ({selectedRowKeys.length})
            </Button>
          </Space>

          {showCapacityHint && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Target section may exceed the generation max size (${generationInfo!.maxSize})`}
              description={`This would bring ${targetSection?.name} to about ${projectedCount} students. Moves are not capacity-checked, so this is only a hint.`}
            />
          )}

          {!isLoading && enrollments.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No unassigned students for this grade and school year."
            />
          ) : (
            <Table<IUnassignedEnrollment>
              size="small"
              rowKey="_id"
              loading={isLoading}
              dataSource={paged}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              pagination={{
                current: page,
                pageSize,
                total: filtered.length,
                showSizeChanger: true,
                onChange: (p, s) => {
                  setPage(p);
                  setPageSize(s);
                },
              }}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Student",
                  key: "student",
                  render: (_, record) => (
                    <StudentCell student={record.studentId} />
                  ),
                },
                {
                  title: "Gender",
                  key: "gender",
                  render: (_, record) => (
                    <GenderTag gender={record.studentId.gender} />
                  ),
                },
                {
                  title: "Action",
                  key: "action",
                  width: 140,
                  render: (_, record) => (
                    <Button
                      size="small"
                      type="link"
                      disabled={!targetSectionId}
                      loading={isMoving}
                      onClick={() =>
                        handleAssignOne(
                          record._id,
                          studentFullName(record.studentId)
                        )
                      }
                    >
                      Assign
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </>
      )}
    </Card>
  );
}
