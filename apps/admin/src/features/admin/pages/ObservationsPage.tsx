import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Space,
  Typography,
  Alert,
  Empty,
  message,
  Modal,
  Tag,
  DatePicker,
} from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { useObservations, type IObservation } from "@/hooks/useObservations";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { useAttributeCategories } from "@/hooks/useAttributeCategories";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ObservationsPage() {
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [teacherId, setTeacherId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const {
    observations,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    refetch,
    remove,
    isDeleting,
  } = useObservations({
    studentId,
    teacherId,
    category,
    pagination,
  });

  // Load options for filters
  const { students = [] } = useStudents();
  const { teachers = [] } = useTeachers();
  const { categories = [] } = useAttributeCategories();

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [studentId, teacherId, category]);

  // Filter options
  const studentOptions = students.map((s: any) => ({
    value: s._id,
    label: `${s.firstName} ${s.lastName}`,
  }));

  const teacherOptions = teachers.map((t: any) => ({
    value: t._id,
    label: `${t.firstName} ${t.lastName}`,
  }));

  const categoryOptions = categories.map((c: any) => ({
    value: c._id,
    label: c.name,
  }));

  // Score color logic
  const getScoreTag = (score: number, minScore: number, maxScore: number) => {
    const ratio = (score - minScore) / (maxScore - minScore);
    let color = "default";
    if (ratio >= 0.8) color = "success";
    else if (ratio >= 0.6) color = "processing";
    else if (ratio >= 0.4) color = "warning";
    else color = "error";

    return (
      <Tag color={color}>
        {score} / {maxScore}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (record: IObservation) => (
        <Space>
          <Text strong>
            {record.studentId ? (
              `${record.studentId.firstName} ${record.studentId.lastName}`
            ) : (
              <Text type="secondary">Deleted Student</Text>
            )}
          </Text>
        </Space>
      ),
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (record: IObservation) =>
        record.teacherId ? (
          `${record.teacherId.firstName} ${record.teacherId.lastName}`
        ) : (
          <Text type="secondary">Unknown Teacher</Text>
        ),
    },
    {
      title: "Category",
      key: "category",
      render: (record: IObservation) =>
        record.category ? (
          record.category.name
        ) : (
          <Text type="secondary">Unknown Category</Text>
        ),
    },
    {
      title: "Score",
      key: "score",
      render: (record: IObservation) => {
        if (!record.category) {
          return <Tag color="default">N/A</Tag>;
        }
        return getScoreTag(
          record.score,
          record.category.minScore,
          record.category.maxScore
        );
      },
    },
    {
      title: "Date",
      key: "date",
      render: (record: IObservation) =>
        dayjs(record.date).format("MMM D, YYYY"),
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: IObservation) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleDelete(record._id)}
          loading={isDeleting}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Observation",
      content: "Are you sure you want to permanently delete this observation?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove(id);
          message.success("Observation deleted successfully");
        } catch {
          // Error handled by useApi
        }
      },
    });
  };

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: 8 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>Observations</Title>
          <Text type="secondary">
            View all teacher-recorded student observations
          </Text>
        </div>

        {/* Filters */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Student"
            allowClear
            showSearch
            optionFilterProp="label"
            options={studentOptions}
            onChange={(value) => setStudentId(value || undefined)}
            value={studentId}
          />
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Teacher"
            allowClear
            showSearch
            optionFilterProp="label"
            options={teacherOptions}
            onChange={(value) => setTeacherId(value || undefined)}
            value={teacherId}
          />
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Category"
            allowClear
            options={categoryOptions}
            onChange={(value) => setCategory(value || undefined)}
            value={category}
          />
        </Space>

        {/* Error Alert */}
        {isError && fetchError && (
          <Alert
            type="error"
            message="Failed to load observations"
            description={fetchError?.message || "Please try again"}
            showIcon
            closable
            onClose={() => refetch()}
          />
        )}

        {/* Table or Empty */}
        {observations.length === 0 && !isLoading ? (
          <Empty description="No observations recorded yet" />
        ) : (
          <DataTable
            data={observations}
            columns={columns}
            loading={isLoading}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, size) =>
                setPagination({ page, pageSize: size || 10 }),
            }}
          />
        )}
      </Space>
    </div>
  );
}
