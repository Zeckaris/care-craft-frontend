import { useState } from "react";
import { Button, message, Form, Modal, Input, Space, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { GradeDrawer } from "@/components/grades/GradeDrawer";
import { useGrades } from "@/hooks/useGrades";
import type { IGrade as HookIGrade } from "@/hooks/useGrades";
import type { IGrade as DrawerIGrade } from "@/components/grades/GradeDrawer";

const { Text } = Typography;

export default function GradesPage() {
  const {
    grades,
    isLoading,
    create,
    update,
    remove,
    removeMany,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGrades();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedGrade, setSelectedGrade] = useState<DrawerIGrade | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState(""); // ← Search state

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: React.Key;
  }>({ open: false });

  const toDrawerGrade = (grade: HookIGrade | null): DrawerIGrade | null => {
    if (!grade) return null;
    return {
      _id: grade._id,
      level: grade.level,
      description: grade.description || null,
      createdAt: grade.createdAt || undefined,
      updatedAt: grade.updatedAt || undefined,
    };
  };

  const openDrawer = (grade: HookIGrade | null, mode: "view" | "edit") => {
    setSelectedGrade(toDrawerGrade(grade));
    setDrawerMode(mode);
    if (grade && mode === "edit") {
      form.setFieldsValue({
        level: grade.level,
        description: grade.description || "",
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedGrade(null);
    form.resetFields();
  };

  const handleView = (grade: HookIGrade) => openDrawer(grade, "view");
  const handleEdit = (grade: HookIGrade) => openDrawer(grade, "edit");
  const handleCreate = () => openDrawer(null, "edit");

  const handleDelete = (key: React.Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Grade deleted");
    } catch (err) {
      message.error("Failed to delete");
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: React.Key[]) => {
    if (keys.length === 0) return;
    Modal.confirm({
      title: `Delete ${keys.length} grade${keys.length > 1 ? "s" : ""}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} grades deleted`);
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedGrade) {
        await update(selectedGrade._id, values);
        message.success("Updated");
      } else {
        await create(values);
        message.success("Created");
      }
      closeDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // FILTER DATA CLIENT-SIDE
  const filteredGrades = grades.filter(
    (grade) =>
      grade.level.toLowerCase().includes(searchText.toLowerCase()) ||
      (grade.description?.toLowerCase().includes(searchText.toLowerCase()) ??
        false)
  );

  const columns = [
    {
      key: "level",
      title: "Level",
      sorter: (a: HookIGrade, b: HookIGrade) => a.level.localeCompare(b.level),
      render: (g: HookIGrade) => <Text strong>{g.level}</Text>,
    },
    {
      key: "description",
      title: "Description",
      render: (g: HookIGrade) =>
        g.description ? g.description : <em style={{ opacity: 0.6 }}>None</em>,
    },
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
        <h2>Grades Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Grade
        </Button>
      </div>

      {/* SEARCH BAR — NOW ON TOP! */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search grades by level or description..."
          prefix={<SearchOutlined />}
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredGrades}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        searchPlaceholder="Search grades..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
      />

      {/* Delete Confirm Modal */}
      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        confirmLoading={isDeleting}
      >
        <p>Are you sure you want to delete this grade?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Drawer */}
      <GradeDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        grade={selectedGrade}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
