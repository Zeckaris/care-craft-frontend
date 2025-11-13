import { useState, useEffect } from "react";
import {
  Button,
  message,
  Form,
  Modal,
  Space,
  Typography,
  Input,
  Tag,
  Alert,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { AssessmentTypeDrawer } from "@/components/assessments/AssessmentTypeDrawer";
import {
  useAssessmentTypes,
  type IAssessmentType,
} from "@/hooks/useAssessmentTypes";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function AssessmentTypesPage() {
  const [searchText, setSearchText] = useState("");

  const {
    types,
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
  } = useAssessmentTypes();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedType, setSelectedType] = useState<IAssessmentType | null>(
    null
  );
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  // Client-side search
  const filteredTypes = searchText
    ? types.filter(
        (t) =>
          t.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (t.description &&
            t.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    : types;

  const openDrawer = (type: IAssessmentType | null, mode: "view" | "edit") => {
    setSelectedType(type);
    setDrawerMode(mode);
    if (type && mode === "edit") {
      form.setFieldsValue({
        name: type.name,
        weight: type.weight,
        description: type.description || "",
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedType(null);
    form.resetFields();
  };

  const handleView = (type: IAssessmentType) => openDrawer(type, "view");
  const handleEdit = (type: IAssessmentType) => openDrawer(type, "edit");
  const handleCreate = () => openDrawer(null, "edit");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Assessment type deleted");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.references) {
        const refs = data.references;
        const usedIn: string[] = [];
        if (refs.setupId) usedIn.push(`Assessment Setup (ID: ${refs.setupId})`);
        if (refs.gradeSubjectAssessmentId)
          usedIn.push("Grade Subject Assessment");

        Modal.error({
          title: "Cannot Delete Assessment Type",
          content: (
            <div>
              <p>This type is used in the following:</p>
              <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                {usedIn.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p>Please remove it from the setup(s) first.</p>
            </div>
          ),
        });
      } else {
        message.error(data?.message || "Failed to delete");
      }
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: Key[]) => {
    if (keys.length === 0) return;
    Modal.confirm({
      title: `Delete ${keys.length} assessment type${
        keys.length > 1 ? "s" : ""
      }?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} assessment types deleted`);
        } catch {
          message.error("Some items could not be deleted");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedType) {
        await update(selectedType._id, values);
        message.success("Assessment type updated");
      } else {
        await create(values);
        message.success("Assessment type created");
      }
      closeDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Type Name",
      sorter: (a: IAssessmentType, b: IAssessmentType) =>
        a.name.localeCompare(b.name),
      render: (type: IAssessmentType) => (
        <Space>
          <Text strong>{type.name}</Text>
        </Space>
      ),
    },
    {
      key: "weight",
      title: "Weight",
      render: (type: IAssessmentType) => (
        <Tag color="var(--primary)" style={{ fontWeight: 500 }}>
          {type.weight}%
        </Tag>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (type: IAssessmentType) =>
        type.description ? (
          <Text style={{ maxWidth: 300 }}>{type.description}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (type: IAssessmentType) =>
        type.createdAt ? dayjs(type.createdAt).format("MMM D, YYYY") : "—",
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
        <h2>Assessment Types</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Type
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
          placeholder="Search types..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
        />
      </div>

      {/* Error Alert */}
      {isError && fetchError && (
        <Alert
          type="error"
          message="Failed to load assessment types"
          description={fetchError.message || "Check console or try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Empty State */}
      {types.length === 0 && !isLoading ? (
        <EmptyState
          title="No assessment types yet"
          description="Start by adding your first assessment type."
          buttonText="Add Type"
          onClick={handleCreate}
        />
      ) : (
        <DataTable
          data={filteredTypes}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          pagination={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
      >
        <p>Are you sure you want to delete this assessment type?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Assessment Type Drawer */}
      <AssessmentTypeDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        type={selectedType}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
