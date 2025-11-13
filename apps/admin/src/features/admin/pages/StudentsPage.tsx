import { useState, useEffect } from "react";
import {
  Button,
  message,
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
import { StudentDrawer } from "@/components/students/StudentDrawer";
import { ImportStudentsButton } from "@/components/students/ImportStudentsButton";
import { useStudents, type IStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import dayjs from "dayjs";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function StudentsPage() {
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const {
    students,
    total,
    currentPage,
    pageSize,
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
    search: searchText,
  });

  const { grades } = useGrades();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [gradeId, searchText]);

  const openDrawer = (student: IStudent | null, mode: "view" | "edit") => {
    setSelectedStudent(student);
    setDrawerMode(mode);
    if (student && mode === "edit") {
      form.setFieldsValue({
        firstName: student.firstName,
        middleName: student.middleName || "",
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth) : null,
      });
    } else {
      form.resetFields();
    }
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
      message.success("Student deleted");
    } catch {
      message.error("Failed to delete");
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
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} students deleted`);
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.dateOfBirth) {
        values.dateOfBirth = values.dateOfBirth.toISOString();
      }
      delete values.profileImage;

      if (selectedStudent) {
        await update(selectedStudent._id, values);
        message.success("Student updated");
      } else {
        await create(values);
        message.success("Student created");
      }
      closeDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
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
          src={student.profileImage}
          style={{ backgroundColor: "var(--primary)" }}
        />
      ),
    },
    {
      key: "fullName",
      title: "Full Name",
      sorter: (a: IStudent, b: IStudent) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
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
          : "—",
    },
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
          : "—",
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
          description={fetchError.message || "Check console or try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Empty State */}
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
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, size) => {
              setPagination({ page, pageSize: size || 10 });
            },
          }}
        />
      )}

      {/* Delete Modal */}
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

      {/* Student Drawer */}
      <StudentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        student={selectedStudent}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
