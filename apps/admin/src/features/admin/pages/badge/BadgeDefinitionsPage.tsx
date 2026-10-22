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
  Modal,
  Avatar,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { BadgeDefinition } from "@carecraft/types";
import { DataTable } from "@/components/common/DataTable";
import { BadgeDefinitionDrawer } from "@/components/badge/BadgeDefinitionDrawer";
import { BadgeDetailDrawer } from "@/components/badge/BadgeDetailDrawer";
import { useBadgeDefinitions } from "@/hooks/useBadgeDefinitions";
import { useGradeOptions } from "@/hooks/useGradeOptions";
import { formatDate } from "@/utils/dateFormat";
import {
  BADGE_LEVEL_OPTIONS,
  getBadgeLevelLabel,
  getEligibleGradeLabels,
  normalizeEligibleGradeIds,
} from "@/utils/badges";
import type { Key } from "antd/es/table/interface";
import Title from "antd/es/typography/Title";

const { Text } = Typography;

const autoAwardFilterOptions = [
  { value: "true", label: "Auto award" },
  { value: "false", label: "Manual award" },
];

export default function BadgeDefinitionsPage() {
  const [searchName, setSearchName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(
    undefined,
  );
  const [selectedAutoAward, setSelectedAutoAward] = useState<
    boolean | undefined
  >(undefined);
  const [selectedEligibleGradeId, setSelectedEligibleGradeId] = useState<
    string | undefined
  >(undefined);
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
    remove,
    isCreating,
    isDeleting,
  } = useBadgeDefinitions({
    name: searchName,
    level: selectedLevel,
    autoAward: selectedAutoAward,
    eligibleGradeId: selectedEligibleGradeId,
    pagination,
  });

  const {
    gradeOptions,
    gradeLabelById,
    isLoading: gradesLoading,
  } = useGradeOptions();

  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBadgeId, setDetailBadgeId] = useState<string | undefined>(
    undefined,
  );
  const [detailInitialBadge, setDetailInitialBadge] =
    useState<BadgeDefinition | null>(null);
  const [detailNotice, setDetailNotice] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    key?: Key;
  }>({
    open: false,
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [
    searchName,
    selectedLevel,
    selectedAutoAward,
    selectedEligibleGradeId,
  ]);

  const openDetail = (
    definition: BadgeDefinition | null,
    notice: string | null = null,
  ) => {
    setDetailBadgeId(definition?._id);
    setDetailInitialBadge(definition);
    setDetailNotice(notice);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailBadgeId(undefined);
    setDetailInitialBadge(null);
    setDetailNotice(null);
  };

  const openCreate = () => {
    form.resetFields();
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    form.resetFields();
  };

  const handleCreate = async (
    values: {
      name: string;
      description: string;
      howToEarn: string;
      level: number;
      eligibleGrades: string[];
    },
    iconFile: File | null,
  ) => {
    try {
      const result = await create(
        { ...values, autoAward: false },
        iconFile || undefined,
      );
      const created = (result as { data?: BadgeDefinition } | undefined)?.data;
      closeCreate();
      openDetail(
        created ?? null,
        "Badge created. You can add criteria now, or leave it teacher-awarded.",
      );
    } catch {
      // Errors are shown by useApi, including backend validation messages.
    }
  };

  const handleRowClick = (definition: BadgeDefinition) =>
    openDetail(definition);
  const handleView = (definition: BadgeDefinition) => openDetail(definition);
  const handleEdit = (definition: BadgeDefinition) => openDetail(definition);

  const handleDelete = (key: Key) => {
    setConfirmDelete({ open: true, key });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.key) return;
    try {
      await remove(String(confirmDelete.key));
    } catch {
      // Errors are shown by useApi.
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const renderEligibleGrades = (record: BadgeDefinition) => {
    const ids = normalizeEligibleGradeIds(record.eligibleGrades);
    if (ids.length === 0) {
      return <Tag color="red">No eligible grades</Tag>;
    }

    if (gradeOptions.length > 0 && ids.length === gradeOptions.length) {
      return <Tag color="blue">All grades</Tag>;
    }

    const labels = getEligibleGradeLabels(
      record.eligibleGrades,
      gradeLabelById,
    );
    const summary = labels.join(", ");

    return (
      <Text ellipsis={{ tooltip: summary }} style={{ maxWidth: 220 }}>
        {summary}
      </Text>
    );
  };

  const renderAwardStatus = (record: BadgeDefinition) => {
    const count = record.criteria?.length ?? 0;
    if (count === 0) {
      return <Tag color="gold">Teacher-awarded</Tag>;
    }
    return (
      <Space wrap size={4}>
        <Tag color="blue">
          {count} criteria
        </Tag>
        <Tag color={record.autoAward ? "green" : "default"}>
          {record.autoAward ? "Auto-award on" : "Auto-award off"}
        </Tag>
      </Space>
    );
  };

  const columns = [
    {
      key: "icon",
      title: "Icon",
      render: (record: BadgeDefinition) => (
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
      render: (record: BadgeDefinition) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary">{getBadgeLevelLabel(record.level)}</Text>
        </Space>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (record: BadgeDefinition) => record.description || "",
    },
    {
      key: "howToEarn",
      title: "How to Earn",
      render: (record: BadgeDefinition) => (
        <Text ellipsis={{ tooltip: record.howToEarn || "" }} style={{ maxWidth: 220 }}>
          {record.howToEarn || ""}
        </Text>
      ),
    },
    {
      key: "eligibleGrades",
      title: "Eligible Grades",
      render: (record: BadgeDefinition) => renderEligibleGrades(record),
    },
    {
      key: "awardStatus",
      title: "Award Status",
      render: (record: BadgeDefinition) => renderAwardStatus(record),
    },
    {
      key: "createdBy",
      title: "Created By",
      render: (record: BadgeDefinition) =>
        record.createdBy && typeof record.createdBy !== "string"
          ? `${record.createdBy.firstName} ${record.createdBy.lastName}`
          : "",
    },
    {
      key: "createdAt",
      title: "Created",
      render: (record: BadgeDefinition) => formatDate(record.createdAt),
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
                Create badges, add criteria and manage auto-award from each
                badge detail.
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              Create Badge
            </Button>
          </div>

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
              onChange={(event) => setSearchName(event.target.value)}
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
              options={BADGE_LEVEL_OPTIONS}
            />
            <Select
              style={{ width: 200 }}
              placeholder="All Award Modes"
              value={
                selectedAutoAward === undefined
                  ? null
                  : String(selectedAutoAward)
              }
              onChange={(value) =>
                setSelectedAutoAward(
                  value === undefined || value === null
                    ? undefined
                    : value === "true",
                )
              }
              allowClear
              options={autoAwardFilterOptions}
            />
            <Select
              style={{ width: 240 }}
              placeholder="All Eligible Grades"
              value={selectedEligibleGradeId ?? null}
              onChange={(value) => setSelectedEligibleGradeId(value ?? undefined)}
              allowClear
              showSearch
              optionFilterProp="label"
              loading={gradesLoading}
              options={gradeOptions}
            />
          </div>

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

          {definitions.length === 0 && !isLoading ? (
            <Empty description="No badge definitions yet">
              <Button type="primary" onClick={openCreate}>
                Create Your First Badge
              </Button>
            </Empty>
          ) : (
            <DataTable
              data={definitions}
              columns={columns}
              loading={isLoading}
              rowKey="_id"
              onRowClick={handleRowClick}
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
        <p>Are you sure you want to delete this badge definition?</p>
        <p>
          This will not affect already awarded badges, but the template will be
          gone.
        </p>
      </Modal>

      <BadgeDefinitionDrawer
        open={createOpen}
        onClose={closeCreate}
        definition={null}
        mode="create"
        form={form}
        onSubmit={handleCreate}
        loading={isCreating}
        gradeOptions={gradeOptions}
        levelOptions={BADGE_LEVEL_OPTIONS}
      />

      <BadgeDetailDrawer
        open={detailOpen}
        onClose={closeDetail}
        badgeId={detailBadgeId}
        initialBadge={detailInitialBadge}
        notice={detailNotice}
      />
    </>
  );
}
