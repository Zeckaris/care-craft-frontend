import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";
import type {
  ISection,
  ISectionRosterEnrollment,
  IBulkMoveSectionResult,
} from "@carecraft/types";
import { useSectionRoster } from "@/hooks/useSectionRoster";
import { useSections } from "@/hooks/useSections";
import { useSectionMoves } from "@/hooks/useSectionMoves";
import { GenderTag, StudentCell } from "./studentAssignmentHelpers";
import {
  type GenerationInfo,
  getErrorMessage,
  sameAcademicYear,
  studentFullName,
} from "./studentAssignmentUtils";

const { Title, Text } = Typography;

interface SectionRosterDrawerProps {
  open: boolean;
  onClose: () => void;
  section: ISection | null;
  generationInfo?: GenerationInfo | null;
}

export function SectionRosterDrawer({
  open,
  onClose,
  section,
  generationInfo,
}: SectionRosterDrawerProps) {
  if (!section) return null;
  return (
    <SectionRosterDrawerContent
      open={open}
      onClose={onClose}
      section={section}
      generationInfo={generationInfo}
    />
  );
}

function SectionRosterDrawerContent({
  open,
  onClose,
  section,
  generationInfo,
}: {
  open: boolean;
  onClose: () => void;
  section: ISection;
  generationInfo?: GenerationInfo | null;
}) {
  const {
    enrollments,
    isLoading,
    isError,
    fetchError,
    refetch,
  } = useSectionRoster(section._id);

  const { sections } = useSections({
    gradeId: section.gradeId?._id,
    schoolYear: section.schoolYear,
    isActive: true,
    pageSize: 500,
  });

  const { bulkMove, moveOne, isMoving } = useSectionMoves();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [targetSectionId, setTargetSectionId] = useState<string | undefined>();

  const { enrollments: targetRoster } = useSectionRoster(targetSectionId);

  useEffect(() => {
    setPage(1);
  }, [searchText, section._id]);

  useEffect(() => {
    setSelectedRowKeys([]);
    setTargetSectionId(undefined);
  }, [section._id]);

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return enrollments;
    return enrollments.filter((e) =>
      studentFullName(e.studentId).toLowerCase().includes(term)
    );
  }, [enrollments, searchText]);

  const studentIndexMap = useMemo(
    () => new Map(enrollments.map((e, idx) => [e._id, idx + 1])),
    [enrollments]
  );

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const targetOptions = sections
    .filter((s) => s._id !== section._id)
    .map((s) => ({ label: s.name, value: s._id }));

  const targetSection = sections.find((s) => s._id === targetSectionId);
  const matchesGeneration =
    !!generationInfo &&
    generationInfo.gradeId === section.gradeId?._id &&
    sameAcademicYear(generationInfo.schoolYear, section.schoolYear);
  const projectedCount = targetRoster.length + selectedRowKeys.length;
  const showCapacityHint =
    matchesGeneration && !!targetSectionId && projectedCount > generationInfo.maxSize;

  const showPartialResult = (result: IBulkMoveSectionResult) => {
    Modal.warning({
      title: `Moved ${result.successCount} of ${result.total} student(s)`,
      width: 560,
      content: (
        <div>
          <p>{result.failedCount} student(s) could not be moved.</p>
          {result.errors.length > 0 && (
            <>
              <p style={{ marginBottom: 4 }}>
                <Text strong>
                  Errors (first {Math.min(result.errors.length, 10)}):
                </Text>
              </p>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {result.errors.slice(0, 10).map((e, i) => (
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

  const handleBulkMove = () => {
    if (!targetSectionId || selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: `Move ${selectedRowKeys.length} student(s) to ${
        targetSection?.name ?? "another section"
      }?`,
      okText: "Move",
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

  const handleMoveOne = async (enrollmentId: string, name: string) => {
    if (!targetSectionId) {
      message.info("Choose a target section first");
      return;
    }
    try {
      await moveOne(enrollmentId, targetSectionId);
      message.success(`Moved ${name}`);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <Drawer
      title={
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Section Students
            </Title>
            <CloseOutlined
              onClick={onClose}
              style={{ cursor: "pointer", fontSize: 16 }}
            />
          </div>
          <div style={{ marginTop: 4 }}>
            <Space size="small" wrap>
              <Text strong>{section.name}</Text>
              <span>•</span>
              <Text type="secondary">{section.gradeId?.level ?? "Grade"}</Text>
              <span>•</span>
              <Text type="secondary">{section.schoolYear}</Text>
              <Tag color={section.isActive ? "green" : "red"}>
                {section.isActive ? "Active" : "Inactive"}
              </Tag>
            </Space>
          </div>
        </div>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      {!section.isActive && (
        <Alert
          type="warning"
          showIcon
          message="Section is inactive"
          description="You can still view its students, but you cannot move students into an inactive section."
          style={{ marginBottom: 16 }}
        />
      )}

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Failed to load the section roster"
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
          style={{ width: 220 }}
          allowClear
        />
        <Select
          placeholder="Move to section"
          style={{ width: 200 }}
          value={targetSectionId}
          onChange={setTargetSectionId}
          options={targetOptions}
          allowClear
          showSearch
          optionFilterProp="label"
        />
        <Button
          type="primary"
          icon={<SwapOutlined />}
          disabled={selectedRowKeys.length === 0 || !targetSectionId}
          loading={isMoving}
          onClick={handleBulkMove}
        >
          Move Selected ({selectedRowKeys.length})
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Space>

      {showCapacityHint && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Target section may exceed the generation max size (${generationInfo?.maxSize})`}
          description={`This would bring ${targetSection?.name} to about ${projectedCount} students. Moves are not capacity-checked, so this is only a hint.`}
        />
      )}

      {!isLoading && enrollments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No active students in this section."
        />
      ) : (
        <Table<ISectionRosterEnrollment>
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
              title: "#",
              key: "rowNumber",
              width: 50,
              align: "center",
              render: (_, record) => (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text-dark)",
                    opacity: 0.65,
                  }}
                >
                  {studentIndexMap.get(record._id) ?? "-"}
                </span>
              ),
            },
            {
              title: "Student",
              key: "student",
              render: (_, record) => <StudentCell student={record.studentId} />,
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
              width: 120,
              render: (_, record) => (
                <Button
                  size="small"
                  type="link"
                  disabled={!targetSectionId}
                  loading={isMoving}
                  onClick={() =>
                    handleMoveOne(record._id, studentFullName(record.studentId))
                  }
                >
                  Move
                </Button>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}
