import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tag,
  Typography,
  Alert,
} from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { SectionDrawer } from "@/components/sections/SectionDrawer";
import { SectionAssignmentsDrawer } from "@/components/sections/SectionAssignmentsDrawer";
import { useSections } from "@/hooks/useSections";
import { useGrades } from "@/hooks/useGrades";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import type { ISection } from "@carecraft/types";

const { Text } = Typography;

export default function SectionsPage() {
  // Filters
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [schoolYear, setSchoolYear] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selected section for Assignments Drawer
  const [assignmentSection, setAssignmentSection] = useState<ISection | null>(
    null
  );
  const [assignmentsOpen, setAssignmentsOpen] = useState(false);

  // Calendar for default school year
  const { currentCalendar } = useAcademicCalendars();

  // Grades for filter picker
  const { grades } = useGrades();

  // Sections data
  const {
    sections,
    total,
    currentPage,
    pageSize: ps,
    isLoading,
    isError,
    fetchError,
    refetch,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSections({ gradeId, schoolYear, page, pageSize });

  // Default to current calendar year on first load
  useEffect(() => {
    if (currentCalendar && !schoolYear) {
      setSchoolYear(currentCalendar.academicYear);
    }
  }, [currentCalendar]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [gradeId, schoolYear]);

  // Drawer state for Section CRUD
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "create"
  );
  const [selectedSection, setSelectedSection] = useState<ISection | null>(
    null
  );
  const [form] = Form.useForm();

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  const openDrawer = (
    section: ISection | null,
    mode: "view" | "edit" | "create"
  ) => {
    setSelectedSection(section);
    setDrawerMode(mode);

    if (section && mode !== "create") {
      form.setFieldsValue({
        gradeId: section.gradeId?._id,
        schoolYear: section.schoolYear,
        name: section.name,
        isActive: section.isActive,
      });
    } else {
      form.resetFields();
      if (currentCalendar) {
        form.setFieldValue("schoolYear", currentCalendar.academicYear);
      }
      form.setFieldValue("isActive", true);
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedSection(null);
    form.resetFields();
  };

  const openAssignments = (section: ISection) => {
    setAssignmentSection(section);
    setAssignmentsOpen(true);
  };

  const closeAssignments = () => {
    setAssignmentsOpen(false);
    setAssignmentSection(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedSection && drawerMode === "edit") {
        await update(selectedSection._id, {
          name: values.name,
          isActive: values.isActive,
        });
        message.success("Section updated successfully");
      } else {
        await create(values);
        message.success("Section created successfully");
      }
      closeDrawer();
    } catch (err: any) {
      if (err?.errorFields) return;
      const msg =
        err?.response?.data?.message || err?.message || "Operation failed";
      message.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await remove(confirmDelete.id);
      message.success("Section deleted successfully");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete section";
      message.error(msg);
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const columns = [
    {
      key: "name",
      title: "Section",
      render: (s: ISection) => <Text strong>{s.name}</Text>,
      sorter: (a: ISection, b: ISection) => a.name.localeCompare(b.name),
    },
    {
      key: "grade",
      title: "Grade",
      render: (s: ISection) => s.gradeId?.level ?? "—",
    },
    {
      key: "schoolYear",
      title: "School Year",
      render: (s: ISection) => s.schoolYear,
    },
    {
      key: "isActive",
      title: "Status",
      render: (s: ISection) => (
        <Tag color={s.isActive ? "green" : "red"}>
          {s.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "assignments",
      title: "Teachers",
      render: (s: ISection) => (
        <Button
          type="primary"
          size="small"
          icon={<TeamOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            openAssignments(s);
          }}
        >
          Assignments
        </Button>
      ),
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
        <div>
          <h2 style={{ margin: 0 }}>Sections Management</h2>
          <Text type="secondary">
            Manage grade sections and assign homeroom and subject teachers
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer(null, "create")}
        >
          Create Section
        </Button>
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
          placeholder="All Grades"
          allowClear
        />
        <Input
          placeholder="School Year (e.g. 2024-25)"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value || undefined)}
          style={{ width: 200 }}
          allowClear
        />
      </div>

      {/* Error */}
      {isError && fetchError && (
        <Alert
          type="error"
          message="Failed to load sections"
          description={fetchError.message || "Try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Table */}
      <DataTable
        data={sections}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        onView={(s) => openDrawer(s, "view")}
        onEdit={(s) => openDrawer(s, "edit")}
        onDelete={(key) => setConfirmDelete({ open: true, id: String(key) })}
        pagination={{
          current: currentPage,
          pageSize: ps,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (p) => setPage(p),
        }}
        extraRowActions={(s: ISection) => [
          {
            key: "assignments",
            label: "Assignments",
            onClick: (record: ISection) => openAssignments(record),
          },
        ]}
      />

      {/* Delete confirm */}
      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={handleDelete}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        confirmLoading={isDeleting}
      >
        <p>Are you sure you want to delete this section?</p>
        <p>
          Deletion is blocked if any enrollments or teaching assignments
          reference it.
        </p>
      </Modal>

      {/* Section drawer (View / Edit / Create) */}
      <SectionDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        section={selectedSection}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        currentYear={currentCalendar?.academicYear}
      />

      {/* Section assignments drawer */}
      <SectionAssignmentsDrawer
        open={assignmentsOpen}
        onClose={closeAssignments}
        section={assignmentSection}
      />
    </>
  );
}
