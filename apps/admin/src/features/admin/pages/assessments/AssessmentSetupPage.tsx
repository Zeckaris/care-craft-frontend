import { useState } from "react";
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
import { AssessmentSetupDrawer } from "@/components/assessments/AssessmentSetupDrawer";
import {
  useAssessmentSetups,
  type IAssessmentSetup,
} from "@/hooks/useAssessmentSetups";
import { useAssessmentTypes } from "@/hooks/useAssessmentTypes";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function AssessmentSetupPage() {
  const [searchText, setSearchText] = useState("");

  const {
    setups,
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
  } = useAssessmentSetups();

  const { types } = useAssessmentTypes(); // For disabling "Add" if no types

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedSetup, setSelectedSetup] = useState<IAssessmentSetup | null>(
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
  const filteredSetups = searchText
    ? setups.filter(
        (s) =>
          s.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (s.description &&
            s.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    : setups;

  const openDrawer = (
    setup: IAssessmentSetup | null,
    mode: "view" | "edit"
  ) => {
    setSelectedSetup(setup);
    setDrawerMode(mode);
    if (setup && mode === "edit") {
      form.setFieldsValue({
        name: setup.name,
        description: setup.description || "",
        assessmentTypeIds: setup.assessmentTypeIds,
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedSetup(null);
    form.resetFields();
  };

  const handleView = (setup: IAssessmentSetup) => openDrawer(setup, "view");
  const handleEdit = (setup: IAssessmentSetup) => openDrawer(setup, "edit");
  const handleCreate = () => openDrawer(null, "edit");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Assessment setup deleted");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.references) {
        const usedIn: string[] = [];
        if (data.references.assessmentScoreId) usedIn.push("Assessment Scores");
        if (data.references.gradeSubjectAssessmentId)
          usedIn.push("Grade Subject Assessment");

        Modal.error({
          title: "Cannot Delete Assessment Setup",
          content: (
            <div>
              <p>This setup is used in the following:</p>
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
      title: `Delete ${keys.length} assessment setup${
        keys.length > 1 ? "s" : ""
      }?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} assessment setups deleted`);
        } catch {
          message.error("Some items could not be deleted");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedSetup) {
        await update(selectedSetup._id, values);
        message.success("Assessment setup updated");
      } else {
        await create(values);
        message.success("Assessment setup created");
      }
      closeDrawer();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Setup Name",
      sorter: (a: IAssessmentSetup, b: IAssessmentSetup) =>
        a.name.localeCompare(b.name),
      render: (setup: IAssessmentSetup) => (
        <Space>
          <Text strong>{setup.name}</Text>
        </Space>
      ),
    },
    {
      key: "types",
      title: "Types",
      render: (setup: IAssessmentSetup) =>
        setup.types && setup.types.length > 0 ? (
          <Space wrap>
            {setup.types.map((type) => (
              <Tag key={type._id} color="var(--primary)">
                {type.name} ({type.weight}%)
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      key: "totalWeight",
      title: "Total Weight",
      render: () => (
        <Tag color="var(--success)" style={{ fontWeight: 600 }}>
          100%
        </Tag>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (setup: IAssessmentSetup) =>
        setup.createdAt ? dayjs(setup.createdAt).format("MMM D, YYYY") : "—",
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
        <h2>Assessment Setups</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          disabled={types.length === 0}
        >
          Add Setup
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
          placeholder="Search setups..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
        />
      </div>

      {/* No Types Warning */}
      {types.length === 0 && !isLoading && (
        <Alert
          type="warning"
          message="No assessment types available"
          description="You must create at least one assessment type before creating a setup."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Error Alert */}
      {isError && fetchError && (
        <Alert
          type="error"
          message="Failed to load assessment setups"
          description={fetchError.message || "Check console or try again later"}
          showIcon
          closable
          onClose={() => refetch()}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Empty State */}
      {setups.length === 0 && !isLoading ? (
        <EmptyState
          title="No assessment setups yet"
          description="Start by creating your first assessment setup."
          buttonText="Add Setup"
          onClick={handleCreate}
        />
      ) : (
        <DataTable
          data={filteredSetups}
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
        <p>Are you sure you want to delete this assessment setup?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Assessment Setup Drawer */}
      <AssessmentSetupDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        setup={selectedSetup}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
