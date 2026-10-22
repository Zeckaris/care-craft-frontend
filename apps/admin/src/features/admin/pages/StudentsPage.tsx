import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Select,
  Space,
  Typography,
  Alert,
  Input,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { reportBulkDelete } from "@/utils/bulkDeleteFeedback";
import { StudentDrawer } from "@/components/students/StudentDrawer";
import { ImportStudentsButton } from "@/components/students/ImportStudentsButton";
import { useStudents, type IStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useDebounce } from "@/hooks/useDebounce";
import dayjs from "dayjs";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";
import { ASSETS_BASE } from "@/services/api-client";

const { Text } = Typography;

export default function StudentsPage() {
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText.trim(), 300);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const {
    students,
    total,
    isLoading,
    isError,
    fetchError,
    refetch,
    create,
    update,
    remove,
    removeMany,
    isCreating,
    isUpdating,
    isDeleting,
  } = useStudents({
    gradeId,
    pagination,
    search: debouncedSearch,
  });

  const { grades } = useGrades();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({ open: false });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [gradeId, debouncedSearch]);

  const openDrawer = (student: IStudent | null, mode: "view" | "edit") => {
    setSelectedStudent(student);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedStudent(null);
    form.resetFields();
  };

  const handleView = (student: IStudent) => openDrawer(student, "view");
  const handleEdit = (student: IStudent) => openDrawer(student, "edit");
  const handleCreate = () => openDrawer(null, "edit");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
    } catch {
      // error toast is shown globally
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: Key[]) => {
    if (keys.length === 0) return;
    Modal.confirm({
      title: `Delete ${keys.length} student${keys.length > 1 ? "s" : ""}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const result = await removeMany(keys.map(String));
        reportBulkDelete(result, "student");
      },
    });
  };

  const handleStudentSubmit = async (formData: FormData) => {
    try {
      if (selectedStudent) {
        await update(selectedStudent._id, formData);
      } else {
        await create(formData);
      }
      closeDrawer();
    } catch {
      // error toast is shown globally
    }
  };

  const columns = [
    {
      key: "profile",
      title: "",
      width: 60,
      render: (student: IStudent) => (
        <Avatar
          size="small"
          icon={<UserOutlined />}
          src={
            student.profileImage?.startsWith("http")
              ? student.profileImage
              : student.profileImage
                ? `${ASSETS_BASE}${student.profileImage}`
                : null
          }
          style={{ backgroundColor: "var(--primary)" }}
        />
      ),
    },
    {
      key: "fullName",
      title: "Full Name",
      sorter: (a: IStudent, b: IStudent) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      render: (student: IStudent) => (
        <Space>
          <Text strong>
            {student.firstName}{" "}
            {student.middleName ? `${student.middleName} ` : ""}
            {student.lastName}
          </Text>
        </Space>
      ),
    },
    {
      key: "gender",
      title: "Gender",
      render: (student: IStudent) => (
        <Text>
          {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
        </Text>
      ),
    },
    {
      key: "dateOfBirth",
      title: "Date of Birth",
      render: (student: IStudent) =>
        student.dateOfBirth
          ? dayjs(student.dateOfBirth).format("MMM D, YYYY")
          : "-",
    },
    // ... rest of columns remain unchanged
    {
      key: "grade",
      title: "Grade",
      render: (student: IStudent) =>
        student.enrollmentId ? (
          <Text strong style={{ color: "var(--primary)" }}>
            {student.enrollmentId.gradeId.level}
          </Text>
        ) : (
          <Text type="secondary">Not enrolled</Text>
        ),
    },
    {
      key: "parent",
      title: "Parent",
      render: (student: IStudent) =>
        student.parentId ? (
          `${student.parentId.firstName} ${student.parentId.lastName}`
        ) : (
          <Text type="secondary">None</Text>
        ),
    },
    {
      key: "admissionDate",
      title: "Admitted",
      render: (student: IStudent) =>
        student.admissionDate
          ? dayjs(student.admissionDate).format("MMM D, YYYY")
          : "-",
    },
  ];

  const gradeOptions = [
    { label: "All Grades", value: "" },
    ...grades.map((g) => ({ label: g.level, value: g._id })),
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2>Students Management</h2>
        <Space>
          <ImportStudentsButton gradeId={gradeId} onSuccess={refetch} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Student
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Text strong>Filter by Grade:</Text>
        <Select
          style={{ width: 200 }}
          options={gradeOptions}
          value={gradeId || ""}
          onChange={(value) => setGradeId(value || undefined)}
          placeholder="All Grades"
          allowClear
        />

        <Input
          placeholder="Search students..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          allowClear
        />
      </div>

      {/* Error Alert */}
      {isError && fetchError && (
        <Alert
          type="error"
          message="Failed to load students"
          description={fetchError.message || "Try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Empty State or Table */}
      {students.length === 0 && !isLoading ? (
        <Empty
          description="No students found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleCreate}>
            Create First Student
          </Button>
        </Empty>
      ) : (
        <DataTable
          data={students}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, size) => {
              setPagination({ page, pageSize: size || 10 });
            },
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
      >
        <p>Are you sure you want to delete this student?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      <StudentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        student={selectedStudent}
        mode={drawerMode}
        form={form}
        onSubmit={handleStudentSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
