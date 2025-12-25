import { useState, useEffect } from "react";
import {
  Button,
  Select,
  Space,
  Typography,
  Alert,
  Empty,
  message,
  Modal,
  Tag,
  Form,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { BadgeCriteriaDrawer } from "@/components/badge/BadgeCriteriaDrawer";
import {
  useBadgeCriteria,
  type IBadgeCriteria,
} from "@/hooks/useBadgeCriteria";
import { useBadgeDefinitions } from "@/hooks/useBadgeDefinitions";
import { useAttributeCategories } from "@/hooks/useAttributeCategories";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text, Title } = Typography;

const criteriaTypeOptions = [
  { value: "scoreThreshold", label: "Score Threshold" },
  { value: "actionPlanProgress", label: "Action Plan Progress" },
  { value: "observationCount", label: "Observation Count" },
  { value: "custom", label: "Custom" },
  {
    value: "attributeEvaluationAverage",
    label: "Attribute Evaluation Average",
  },
];

export default function BadgeCriteriaPage() {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | undefined>(
    undefined
  );
  const [selectedType, setSelectedType] = useState<
    IBadgeCriteria["type"] | undefined
  >(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    criteria,
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
  } = useBadgeCriteria({
    badgeDefinitionId: selectedBadgeId,
    type: selectedType,
    pagination,
  });

  const { definitions: allDefinitions } = useBadgeDefinitions();

  // ← Fetch ALL attribute categories for the drawer dropdown
  const { categories: attributeCategories } = useAttributeCategories({
    all: true,
  });

  const attributeCategoryOptions = attributeCategories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const badgeOptions = allDefinitions.map((bd) => ({
    value: bd._id,
    label: `${bd.name} (Level ${bd.level})`,
  }));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">(
    "view"
  );
  const [selectedCriteria, setSelectedCriteria] =
    useState<IBadgeCriteria | null>(null);
  const [form] = Form.useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [selectedBadgeId, selectedType]);

  const openDrawer = (
    crit: IBadgeCriteria | null,
    mode: "view" | "create" | "edit"
  ) => {
    setSelectedCriteria(crit);
    setDrawerMode(mode);
    if (crit && mode !== "create") {
      form.setFieldsValue({
        badgeDefinitionId: crit.badgeDefinitionId,
        type: crit.type,
        description: crit.description || "",
        attributeCategoryId: crit.attributeCategoryId || null,
        minScore: crit.minScore || null,
        actionPlanId: crit.actionPlanId || null,
        minProgress: crit.minProgress || null,
        minObservations: crit.minObservations || null,
        scope: crit.scope || null,
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCriteria(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Convert numeric fields to actual numbers (AntD sends them as strings)
      const transformedValues = {
        ...values,
        minScore:
          values.minScore !== undefined ? Number(values.minScore) : null,
        minProgress:
          values.minProgress !== undefined ? Number(values.minProgress) : null,
        minObservations:
          values.minObservations !== undefined
            ? Number(values.minObservations)
            : null,
      };

      if (drawerMode === "create") {
        await create(transformedValues);
        message.success("Criteria created successfully");
      } else if (drawerMode === "edit" && selectedCriteria) {
        await update(selectedCriteria._id, transformedValues);
        message.success("Criteria updated successfully");
      }
      closeDrawer();
    } catch (error: any) {
      // Validation or API error — already handled by useApi or form
    }
  };

  const handleView = (crit: IBadgeCriteria) => openDrawer(crit, "view");
  const handleEdit = (crit: IBadgeCriteria) => openDrawer(crit, "edit");
  const handleCreate = () => openDrawer(null, "create");

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
      message.success("Criteria deleted successfully");
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const columns = [
    {
      key: "badge",
      title: "Badge Definition",
      render: (record: IBadgeCriteria) => {
        const badge = allDefinitions.find(
          (bd) => bd._id === record.badgeDefinitionId
        );
        return badge ? (
          <Space>
            <Text strong>{badge.name}</Text>
            <Tag>Level {badge.level}</Tag>
          </Space>
        ) : (
          "-"
        );
      },
    },
    {
      key: "type",
      title: "Type",
      render: (record: IBadgeCriteria) => (
        <Tag>
          {criteriaTypeOptions.find((t) => t.value === record.type)?.label ||
            record.type}
        </Tag>
      ),
    },
    {
      key: "details",
      title: "Details",
      render: (record: IBadgeCriteria) => (
        <Space direction="vertical" size={2}>
          {record.minScore && <Text>Min Score: {record.minScore}</Text>}
          {record.minProgress && (
            <Text>Min Progress: {record.minProgress}%</Text>
          )}
          {record.minObservations && (
            <Text>Min Observations: {record.minObservations}</Text>
          )}
          {record.scope && (
            <Text>
              Scope: {record.scope === "yearly" ? "Yearly" : "All Time"}
            </Text>
          )}
          {record.description && (
            <Text type="secondary">{record.description}</Text>
          )}
          {!record.minScore &&
            !record.minProgress &&
            !record.minObservations &&
            !record.description &&
            "-"}
        </Space>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (record: IBadgeCriteria) =>
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
                Badge Criteria
              </Title>
              <Text type="secondary">
                Define conditions required to earn badges
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Criteria
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
            <Select
              style={{ width: 300 }}
              placeholder="All Badge Definitions"
              value={selectedBadgeId ?? null}
              onChange={(value) => setSelectedBadgeId(value ?? undefined)}
              allowClear
              showSearch
              optionFilterProp="label"
              options={badgeOptions}
            />
            <Select
              style={{ width: 240 }}
              placeholder="All Types"
              value={selectedType ?? null}
              onChange={(value) => setSelectedType(value ?? undefined)}
              allowClear
              options={criteriaTypeOptions}
            />
          </div>

          {isError && fetchError && (
            <Alert
              type="error"
              message="Failed to load criteria"
              description={fetchError.message || "Please try again"}
              showIcon
              closable
              onClose={() => refetch()}
              style={{ marginBottom: 16 }}
            />
          )}

          {criteria.length === 0 && !isLoading ? (
            <Empty description="No criteria defined yet">
              <Button type="primary" onClick={handleCreate}>
                Create Your First Criteria
              </Button>
            </Empty>
          ) : (
            <DataTable
              data={criteria}
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

      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
      >
        <p>Are you sure you want to delete this criteria?</p>
        <p>This may affect badges that use it.</p>
      </Modal>

      <BadgeCriteriaDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        criteria={selectedCriteria}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        badgeDefinitions={allDefinitions}
        attributeCategoryOptions={attributeCategoryOptions}
      />
    </>
  );
}
