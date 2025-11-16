import { useState, useEffect } from "react";
import {
  Button,
  message,
  Form,
  Select,
  Space,
  Typography,
  Alert,
  Input,
  Modal,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { EnrollmentDrawer } from "@/components/enroll/EnrollmentDrawer";
import { BulkEnrollmentDrawer } from "@/components/enroll/BulkEnrollmentDrawer";
import { useEnrollments, type IEnrollment } from "@/hooks/useEnrollments";
import { useGrades } from "@/hooks/useGrades";
import { useStudents } from "@/hooks/useStudents";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function EnrollPage() {
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [schoolYear, setSchoolYear] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const {
    enrollments,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    refetch,
    create,
    bulkCreate,
    update,
    toggleActive,
    remove,
    removeMany,
    isCreating,
    isBulkCreating,
    isUpdating,
    isToggling,
    isDeleting,
  } = useEnrollments({
    gradeId,
    schoolYear,
    isActive,
    pagination,
    search: searchText,
  });

  const { grades } = useGrades();
  const { students } = useStudents({ pagination: { page: 1, pageSize: 1000 } });

  // Drawers
  const [singleDrawerOpen, setSingleDrawerOpen] = useState(false);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<IEnrollment | null>(null);
  const [form] = Form.useForm();

  // Delete
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  // Reset page on filter change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [gradeId, schoolYear, isActive, searchText]);

  // === Handlers ===
  const openSingleDrawer = (
    enrollment: IEnrollment | null,
    mode: "view" | "edit"
  ) => {
    setSelectedEnrollment(enrollment);
    setDrawerMode(mode);
    if (enrollment && mode === "edit") {
      form.setFieldsValue({
        gradeId: enrollment.gradeId._id,
        schoolYear: enrollment.schoolYear,
      });
    } else {
      form.resetFields();
    }
    setSingleDrawerOpen(true);
  };

  const openBulkDrawer = () => {
    setBulkDrawerOpen(true);
  };

  const closeSingleDrawer = () => {
    setSingleDrawerOpen(false);
    setSelectedEnrollment(null);
    form.resetFields();
  };

  const closeBulkDrawer = () => {
    setBulkDrawerOpen(false);
  };

  const handleView = (enrollment: IEnrollment) =>
    openSingleDrawer(enrollment, "view");
  const handleEdit = (enrollment: IEnrollment) =>
    openSingleDrawer(enrollment, "edit");
  const handleCreateSingle = () => openSingleDrawer(null, "edit");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Enrollment deleted");
    } catch {
      message.error("Failed to delete");
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: Key[]) => {
    if (keys.length === 0) return;
    Modal.confirm({
      title: `Delete ${keys.length} enrollment${keys.length > 1 ? "s" : ""}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} enrollments deleted`);
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const handleSingleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedEnrollment) {
        await update(selectedEnrollment._id, values);
        message.success("Enrollment updated");
      } else {
        const { studentId, gradeId, schoolYear } = values;
        if (!studentId) {
          message.error("Please select a student");
          return;
        }
        await create({ studentId, gradeId, schoolYear });
        message.success("Student enrolled successfully");
      }
      closeSingleDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleBulkSubmit = async (data: any) => {
    try {
      await bulkCreate(data);
      message.success("Students enrolled successfully");
      closeBulkDrawer();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors?.length) {
        errors.slice(0, 5).forEach((e: string) => message.error(e));
      } else {
        message.error("Failed to enroll students");
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive(id);
      message.success("Status updated");
    } catch {
      message.error("Failed to update status");
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // === Table Columns ===
  // === Table Columns ===
  const columns = [
    {
      key: "student",
      title: "Student",
      render: (enrollment: IEnrollment) => {
        const student = enrollment.studentId;
        if (!student) {
          return <Text type="secondary">Student not found</Text>;
        }

        const profileUrl = student.profileImage || null;

        return (
          <Space>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={profileUrl}
              style={{ backgroundColor: "var(--primary)" }}
            />
            <Text strong>
              {student.firstName} {student.middleName || ""} {student.lastName}
            </Text>
          </Space>
        );
      },
    },
    {
      key: "grade",
      title: "Grade",
      render: (enrollment: IEnrollment) => {
        const grade = enrollment.gradeId;
        return (
          <Text
            strong
            style={{ color: grade ? "var(--primary)" : "var(--text-disabled)" }}
          >
            {grade ? grade.level : "—"}
          </Text>
        );
      },
    },
    {
      key: "year",
      title: "School Year",
      render: (enrollment: IEnrollment) => {
        const year = enrollment.schoolYear;
        if (!year) return <Text type="secondary">—</Text>;
        return <Text strong>{year}</Text>;
      },
    },
    {
      key: "status",
      title: "Status",
      render: (enrollment: IEnrollment) => (
        <Tag color={enrollment.isActive ? "green" : "red"}>
          {enrollment.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "enrolledOn",
      title: "Enrolled On",
      render: (enrollment: IEnrollment) =>
        enrollment.createdAt
          ? new Date(enrollment.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "toggle",
      title: "Action",
      width: 120,
      render: (enrollment: IEnrollment) => (
        <Button
          size="small"
          type="link"
          onClick={() => handleToggleActive(enrollment._id)}
          loading={isToggling}
        >
          {enrollment.isActive ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  const gradeOptions = [
    { label: "All Grades", value: "" },
    ...grades.map((g) => ({ label: g.level, value: g._id })),
  ];

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
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
        <h2>Enrollment Management</h2>
        <Space>
          <Button
            type="default"
            icon={<TeamOutlined />}
            onClick={openBulkDrawer}
          >
            Enroll Many
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreateSingle}
          >
            Enroll One
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
        <Text strong>Filter by:</Text>
        <Select
          style={{ width: 160 }}
          options={gradeOptions}
          value={gradeId || ""}
          onChange={(v) => setGradeId(v || undefined)}
          placeholder="Grade"
          allowClear
        />
        <Input
          placeholder="School Year (e.g. 2024-25)"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value || undefined)}
          style={{ width: 180 }}
          allowClear
        />
        <Select
          style={{ width: 140 }}
          options={statusOptions}
          value={isActive === undefined ? "" : String(isActive)}
          onChange={(v) => setIsActive(v === "" ? undefined : v === "true")}
          placeholder="Status"
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

      {/* Error */}
      {isError && fetchError && (
        <Alert
          type="error"
          message="Failed to load enrollments"
          description={fetchError.message || "Try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Empty */}
      {enrollments.length === 0 && !isLoading ? (
        <Empty description="No enrollments found">
          <Button type="primary" onClick={openBulkDrawer}>
            Enroll Students Now
          </Button>
        </Empty>
      ) : (
        <DataTable
          data={enrollments}
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
        <p>Are you sure you want to delete this enrollment?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Single Drawer */}
      <EnrollmentDrawer
        open={singleDrawerOpen}
        onClose={closeSingleDrawer}
        enrollment={selectedEnrollment}
        mode={drawerMode}
        form={form}
        onSubmit={handleSingleSubmit}
        loading={isCreating || isUpdating}
      />

      {/* Bulk Drawer */}
      <BulkEnrollmentDrawer
        open={bulkDrawerOpen}
        onClose={closeBulkDrawer}
        onSubmit={handleBulkSubmit}
        loading={isBulkCreating}
      />
    </>
  );
}
