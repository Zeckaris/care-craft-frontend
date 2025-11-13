import { useState, useEffect } from "react";
import {
  Button,
  message,
  Form,
  Modal,
  Space,
  Typography,
  Input,
  Avatar,
  Alert,
} from "antd";
import { PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { SubjectDrawer } from "@/components/subjects/SubjectDrawer";
import { useSubjects, type ISubject } from "@/hooks/useSubjects";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function SubjectsPage() {
  const [searchText, setSearchText] = useState("");

  const {
    subjects,
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
  } = useSubjects();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  // Filter subjects client-side
  const filteredSubjects = searchText
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (s.description &&
            s.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    : subjects;

  const openDrawer = (subject: ISubject | null, mode: "view" | "edit") => {
    setSelectedSubject(subject);
    setDrawerMode(mode);
    if (subject && mode === "edit") {
      form.setFieldsValue({
        name: subject.name,
        description: subject.description || "",
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedSubject(null);
    form.resetFields();
  };

  const handleView = (subject: ISubject) => openDrawer(subject, "view");
  const handleEdit = (subject: ISubject) => openDrawer(subject, "edit");
  const handleCreate = () => openDrawer(null, "edit");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Subject deleted");
    } catch {
      message.error("Failed to delete");
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: Key[]) => {
    if (keys.length === 0) return;
    Modal.confirm({
      title: `Delete ${keys.length} subject${keys.length > 1 ? "s" : ""}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} subjects deleted`);
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedSubject) {
        await update(selectedSubject._id, values);
        message.success("Subject updated");
      } else {
        await create(values);
        message.success("Subject created");
      }
      closeDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Subject Name",
      sorter: (a: ISubject, b: ISubject) => a.name.localeCompare(b.name),
      render: (subject: ISubject) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          <Text strong>{subject.name}</Text>
        </Space>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (subject: ISubject) =>
        subject.description ? (
          <Text style={{ maxWidth: 300 }}>{subject.description}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (subject: ISubject) =>
        subject.createdAt
          ? dayjs(subject.createdAt).format("MMM D, YYYY")
          : "—",
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
        <h2>Subjects Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Subject
        </Button>
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Search subjects..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
        />
      </div>

      {/* Error Alert */}
      {isError && fetchError && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            message="Failed to load subjects"
            description={
              fetchError.message || "Check console or try again later"
            }
            showIcon
            closable
            onClose={() => refetch()}
          />
        </div>
      )}

      {/* Empty State */}
      {subjects.length === 0 && !isLoading ? (
        <EmptyState
          title="No subjects yet"
          description="Start by adding your first subject to the system."
          buttonText="Add Subject"
          onClick={handleCreate}
        />
      ) : (
        <DataTable
          data={filteredSubjects}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          searchPlaceholder="Search subjects..."
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          pagination={false} // No pagination – small dataset
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
        <p>Are you sure you want to delete this subject?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Subject Drawer */}
      <SubjectDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        subject={selectedSubject}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
