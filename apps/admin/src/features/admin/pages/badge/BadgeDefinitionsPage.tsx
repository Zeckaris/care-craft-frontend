import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Alert,
  Empty,
  message,
  Modal,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { BadgeDefinitionDrawer } from "@/components/badge/BadgeDefinitionDrawer";
import {
  useBadgeDefinitions,
  type IBadgeDefinition,
} from "@/hooks/useBadgeDefinitions";
import { useBadgeCriteria } from "@/hooks/useBadgeCriteria";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";
import Title from "antd/es/typography/Title";

const { Text } = Typography;

export default function BadgeDefinitionsPage() {
  const [searchName, setSearchName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    definitions,
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
    isCreating,
    isUpdating,
    isDeleting,
  } = useBadgeDefinitions({
    name: searchName,
    level: selectedLevel,
    pagination,
  });

  // For criteria selection in drawer
  const { criteria: allCriteria } = useBadgeCriteria(); // No filters

  const availableCriteriaOptions = allCriteria.map((c) => ({
    value: c._id,
    label: `${c.type.replace(/([A-Z])/g, " $1").trim()} ${
      c.description ? `- ${c.description}` : ""
    }`,
  }));

  const levelOptions = [
    { value: 1, label: "Level 1 (Bronze)" },
    { value: 2, label: "Level 2 (Silver)" },
    { value: 3, label: "Level 3 (Gold)" },
    { value: 4, label: "Level 4 (Platinum)" },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">(
    "view"
  );
  const [selectedDefinition, setSelectedDefinition] =
    useState<IBadgeDefinition | null>(null);
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  // Reset page when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchName, selectedLevel]);

  const openDrawer = (
    definition: IBadgeDefinition | null,
    mode: "view" | "create" | "edit"
  ) => {
    setSelectedDefinition(definition);
    setDrawerMode(mode);
    if (definition && mode !== "create") {
      form.setFieldsValue({
        name: definition.name,
        description: definition.description,
        level: definition.level,
        criteria: definition.criteria.map((c) => c._id),
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedDefinition(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any, iconFile: File | null) => {
    try {
      // Clean values: ensure required fields are present
      const cleanValues: {
        name: string;
        description: string;
        level: number;
        criteria?: string[];
      } = {
        name: values.name as string,
        description: values.description as string,
        level: values.level as number,
        criteria: values.criteria || undefined,
      };

      if (drawerMode === "create") {
        await create(cleanValues, iconFile || undefined);
        message.success("Badge definition created successfully");
      } else if (drawerMode === "edit" && selectedDefinition) {
        // For update, we only send fields that changed (optional)
        const updateValues: {
          name?: string;
          description?: string;
          level?: number;
          criteria?: string[];
        } = {
          name:
            values.name !== selectedDefinition.name ? values.name : undefined,
          description:
            values.description !== selectedDefinition.description
              ? values.description
              : undefined,
          level:
            values.level !== selectedDefinition.level
              ? values.level
              : undefined,
          criteria: values.criteria || undefined, // always allow updating criteria
        };

        // Only send if something changed
        await update(
          selectedDefinition._id,
          updateValues,
          iconFile || undefined
        );
        message.success("Badge definition updated successfully");
      }

      closeDrawer();
    } catch (error: any) {
      // Error already handled by useApi (shows message.error)
    }
  };
  const handleView = (def: IBadgeDefinition) => openDrawer(def, "view");
  const handleEdit = (def: IBadgeDefinition) => openDrawer(def, "edit");
  const handleCreate = () => openDrawer(null, "create");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Badge definition deleted successfully");
    } catch (error: any) {
      // Handled by useApi
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const columns = [
    {
      key: "icon",
      title: "Icon",
      render: (record: IBadgeDefinition) => (
        <Avatar
          size={48}
          icon={<TrophyOutlined />}
          src={record.icon || undefined}
          style={{ backgroundColor: "#f56a00" }}
        />
      ),
    },
    {
      key: "name",
      title: "Name",
      render: (record: IBadgeDefinition) => (
        <Space direction="vertical">
          <Text strong>{record.name}</Text>
          <Text type="secondary">Level {record.level}</Text>
        </Space>
      ),
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      key: "criteria",
      title: "Criteria",
      render: (record: IBadgeDefinition) => record.criteria.length,
    },
    {
      key: "createdBy",
      title: "Created By",
      render: (record: IBadgeDefinition) => (
        <Text>
          {record.createdBy.firstName} {record.createdBy.lastName}
        </Text>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (record: IBadgeDefinition) =>
        dayjs(record.createdAt).format("MMM D, YYYY"),
    },
  ];

  return (
    <>
      <div style={{ padding: "24px", background: "#fff", borderRadius: 8 }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0 }}>
                Badge Definitions
              </Title>
              <Text type="secondary">
                Create and manage achievement badges for students
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Badge
            </Button>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Text strong>Filter by:</Text>
            <Input
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              style={{ width: 200 }}
              placeholder="All Levels"
              value={selectedLevel ?? null}
              onChange={(value) => setSelectedLevel(value ?? undefined)}
              allowClear
              options={levelOptions}
            />
          </div>

          {/* Error Alert */}
          {isError && fetchError && (
            <Alert
              type="error"
              message="Failed to load badge definitions"
              description={fetchError.message || "Please try again"}
              showIcon
              closable
              onClose={() => refetch()}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Table or Empty */}
          {definitions.length === 0 && !isLoading ? (
            <Empty description="No badge definitions yet">
              <Button type="primary" onClick={handleCreate}>
                Create Your First Badge
              </Button>
            </Empty>
          ) : (
            <DataTable
              data={definitions}
              columns={columns}
              loading={isLoading}
              rowKey="_id"
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
        <p>Are you sure you want to delete this badge definition?</p>
        <p>
          This will not affect already awarded badges, but the template will be
          gone.
        </p>
      </Modal>

      {/* Drawer - REMOVED the 4 file/preview props */}
      <BadgeDefinitionDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        definition={selectedDefinition}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        availableCriteria={availableCriteriaOptions}
        levelOptions={levelOptions}
      />
    </>
  );
}
