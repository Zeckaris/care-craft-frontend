import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TrophyOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { BadgeCriteria, BadgeDefinition } from '@carecraft/types';
import {
  formatCriterionSummary,
  getBadgeCriteriaTypeLabel,
  getBadgeProgressScopeLabel,
  isKnownBadgeCriteriaType,
} from '@carecraft/badges';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { BadgeCriterionDrawer } from '@/components/badge/BadgeCriterionDrawer';
import { useAttributeCategories } from '@/hooks/useAttributeCategories';
import { useBadgeCriteria } from '@/hooks/useBadgeCriteria';
import {
  useBadgeDefinitionDetail,
  useBadgeDefinitions,
} from '@/hooks/useBadgeDefinitions';
import { useGradeOptions } from '@/hooks/useGradeOptions';
import { useSubjects } from '@/hooks/useSubjects';
import {
  BADGE_LEVEL_OPTIONS,
  getBadgeLevelLabel,
  getEligibleGradeLabels,
  normalizeEligibleGradeIds,
} from '@/utils/badges';

const { Text } = Typography;
const { TextArea } = Input;

interface BadgeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  badgeId?: string;
  initialBadge?: BadgeDefinition | null;
  notice?: string | null;
  onSaved?: () => void;
}

function readObjectId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

export function BadgeDetailDrawer({
  open,
  onClose,
  badgeId,
  initialBadge,
  notice,
  onSaved,
}: BadgeDetailDrawerProps) {
  const [form] = Form.useForm();
  const { badge: detail, refetch } = useBadgeDefinitionDetail(
    open ? badgeId : undefined,
  );
  const badge = detail ?? initialBadge ?? null;

  const { update, isUpdating } = useBadgeDefinitions();
  const {
    remove: removeCriterion,
    isDeleting: isDeletingCriterion,
  } = useBadgeCriteria({ badgeDefinitionId: badgeId });
  const { gradeOptions, gradeLabelById } = useGradeOptions();
  const { categories } = useAttributeCategories({ all: true });
  const { subjects } = useSubjects();

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [criterionDrawerOpen, setCriterionDrawerOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] =
    useState<BadgeCriteria | null>(null);

  const attributeCategoryNameById = useMemo(
    () => new Map(categories.map((category) => [category._id, category.name])),
    [categories],
  );

  const subjectNameById = useMemo(
    () => new Map(subjects.map((subject) => [subject._id, subject.name])),
    [subjects],
  );

  useEffect(() => {
    if (!open) return;
    setIconFile(null);
    setIconPreview(badge?.icon || '');
    setActionError(null);
    setCriterionDrawerOpen(false);
    setEditingCriterion(null);
  }, [open, badge?._id, badge?.icon]);

  useEffect(() => {
    if (!open || !badge) return;
    form.setFieldsValue({
      name: badge.name,
      description: badge.description,
      howToEarn: badge.howToEarn ?? '',
      level: badge.level,
      eligibleGrades: normalizeEligibleGradeIds(badge.eligibleGrades),
    });
  }, [badge, form, open]);

  useEffect(() => {
    return () => {
      if (iconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const criteria = badge?.criteria ?? [];
  const automaticCriteriaCount = criteria.filter((criterion) =>
    isKnownBadgeCriteriaType(criterion.type),
  ).length;
  const hasCriteria = criteria.length > 0;

  const handleUploadChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj as File | undefined;
    if (!file) return;
    if (iconPreview.startsWith('blob:')) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSaveDetails = async () => {
    if (!badge) return;
    setActionError(null);
    try {
      const values = await form.validateFields();
      await update(
        badge._id,
        {
          name: values.name,
          description: values.description,
          howToEarn: values.howToEarn ?? '',
          level: values.level,
          eligibleGrades: values.eligibleGrades || [],
        },
        iconFile || undefined,
      );
      setIconFile(null);
      await refetch();
      onSaved?.();
    } catch (error: any) {
      if (error?.errorFields) return;
      setActionError(extractApiErrorMessage(error));
    }
  };

  const handleToggleAutoAward = async (checked: boolean) => {
    if (!badge) return;
    setActionError(null);
    try {
      await update(badge._id, { autoAward: checked });
      await refetch();
      onSaved?.();
    } catch (error) {
      setActionError(extractApiErrorMessage(error));
    }
  };

  const handleAddCriterion = () => {
    setEditingCriterion(null);
    setCriterionDrawerOpen(true);
  };

  const handleEditCriterion = (criterion: BadgeCriteria) => {
    if (!isKnownBadgeCriteriaType(criterion.type)) return;
    setEditingCriterion(criterion);
    setCriterionDrawerOpen(true);
  };

  const handleDeleteCriterion = (criterion: BadgeCriteria) => {
    if (!badge) return;
    Modal.confirm({
      title: 'Delete this criterion?',
      content: badge.autoAward ? (
        <div>
          <p>
            This badge has auto-award enabled. If this is its last automatic
            criterion, delete it only after turning auto-award off.
          </p>
          <p>The backend will block deleting the last automatic criterion.</p>
        </div>
      ) : (
        <p>This removes the criterion from the badge. It cannot be undone.</p>
      ),
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, loading: isDeletingCriterion },
      onOk: async () => {
        setActionError(null);
        try {
          await removeCriterion(criterion._id, badge._id);
          await refetch();
          onSaved?.();
        } catch (error) {
          setActionError(extractApiErrorMessage(error));
        }
      },
    });
  };

  const getCriterionSummary = (criterion: BadgeCriteria) => {
    const record = criterion as unknown as Record<string, unknown>;
    const categoryId = readObjectId(record.attributeCategoryId);
    const subjectId = readObjectId(record.subjectId);
    return formatCriterionSummary(criterion, {
      attributeCategoryName: categoryId
        ? attributeCategoryNameById.get(categoryId) ?? categoryId
        : null,
      subjectName: subjectId
        ? subjectNameById.get(subjectId) ?? subjectId
        : null,
    });
  };

  const eligibleGradeLabels = getEligibleGradeLabels(
    badge?.eligibleGrades,
    gradeLabelById,
  );

  return (
    <>
      <Drawer
        title={
          <Space>
            <Avatar
              size={40}
              icon={<TrophyOutlined />}
              src={iconPreview || undefined}
              style={{ backgroundColor: '#f56a00' }}
            />
            <span>{badge?.name || 'Badge details'}</span>
            {badge && <Tag>{getBadgeLevelLabel(badge.level)}</Tag>}
          </Space>
        }
        width={780}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        {!badge ? (
          <Empty description="Select a badge to manage it" />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {notice && (
              <Alert
                type="success"
                showIcon
                message={notice}
                closable
              />
            )}

            {actionError && (
              <Alert
                type="error"
                showIcon
                message="Action failed"
                description={actionError}
                closable
                onClose={() => setActionError(null)}
              />
            )}

            <section>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Details
              </Typography.Title>
              <Form form={form} layout="vertical">
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <Form.Item label="Badge icon">
                    <Space
                      direction="vertical"
                      align="center"
                      style={{ width: 130 }}
                    >
                      <Avatar
                        size={96}
                        icon={<TrophyOutlined />}
                        src={iconPreview || undefined}
                        style={{ backgroundColor: '#f56a00' }}
                      />
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleUploadChange}
                        maxCount={1}
                      >
                        <Button size="small" icon={<UploadOutlined />}>
                          {iconFile ? 'Change' : 'Upload'}
                        </Button>
                      </Upload>
                      {eligibleGradeLabels.length > 0 && (
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, textAlign: 'center' }}
                        >
                          {eligibleGradeLabels.length === gradeOptions.length
                            ? 'All grades'
                            : `${eligibleGradeLabels.length} grade${
                                eligibleGradeLabels.length === 1 ? '' : 's'
                              }`}
                        </Text>
                      )}
                    </Space>
                  </Form.Item>

                  <div style={{ flex: '1 1 420px', minWidth: 280 }}>
                    <Space style={{ display: 'flex', gap: 12 }} align="start">
                      <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                          { required: true, message: 'Badge name is required' },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="e.g., Communication Excellence" />
                      </Form.Item>
                      <Form.Item
                        name="level"
                        label="Level"
                        rules={[
                          { required: true, message: 'Level is required' },
                        ]}
                      >
                        <Select
                          style={{ width: 180 }}
                          options={BADGE_LEVEL_OPTIONS}
                        />
                      </Form.Item>
                    </Space>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        {
                          required: true,
                          message: 'Description is required',
                        },
                      ]}
                    >
                      <TextArea
                        placeholder="Describe what this badge represents"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="howToEarn"
                      label="How to earn"
                      extra="Optional. Shown to teachers and students. Up to 500 characters."
                    >
                      <TextArea
                        maxLength={500}
                        showCount
                        placeholder="Explain how a student can earn this badge"
                        autoSize={{ minRows: 2, maxRows: 5 }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="eligibleGrades"
                      label="Eligible grades"
                      rules={[
                        {
                          required: true,
                          type: 'array',
                          min: 1,
                          message: 'Select at least one eligible grade',
                        },
                      ]}
                      extra="A badge can only be awarded to students in the selected grades."
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select eligible grades"
                        options={gradeOptions}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        maxTagCount="responsive"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      onClick={handleSaveDetails}
                      loading={isUpdating}
                    >
                      Save details
                    </Button>
                  </div>
                </div>
              </Form>
            </section>

            <Divider style={{ margin: 0 }} />

            <section>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Criteria
                  </Typography.Title>
                  <Text type="secondary">
                    {hasCriteria
                      ? `${criteria.length} criteria`
                      : 'No criteria yet. This badge is teacher-awarded.'}
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCriterion}
                >
                  Add criterion
                </Button>
              </div>

              {!hasCriteria ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Add a criterion to make this badge eligible for auto-award, or leave it teacher-awarded."
                />
              ) : (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {criteria.map((criterion) => {
                    const isLegacy = !isKnownBadgeCriteriaType(criterion.type);
                    const scope = 'scope' in criterion ? criterion.scope : null;
                    const scopeLabel = scope
                      ? getBadgeProgressScopeLabel(scope)
                      : null;
                    return (
                      <div
                        key={criterion._id}
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <Space wrap size={4}>
                              <Tag>
                                {isLegacy
                                  ? 'Legacy criterion'
                                  : getBadgeCriteriaTypeLabel(criterion.type)}
                              </Tag>
                              {scopeLabel && <Tag>{scopeLabel}</Tag>}
                            </Space>
                            <div style={{ marginTop: 6 }}>
                              <Text>
                                {isLegacy
                                  ? 'This criterion uses an older format. It is read only and can only be deleted.'
                                  : getCriterionSummary(criterion)}
                              </Text>
                            </div>
                            {criterion.description && (
                              <Text
                                type="secondary"
                                style={{ display: 'block', marginTop: 4 }}
                              >
                                {criterion.description}
                              </Text>
                            )}
                          </div>
                          <Space size="small">
                            {!isLegacy && (
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEditCriterion(criterion)}
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteCriterion(criterion)}
                            >
                              Delete
                            </Button>
                          </Space>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              )}
            </section>

            <Divider style={{ margin: 0 }} />

            <section>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Auto-award
              </Typography.Title>
              <Space direction="vertical" size={4}>
                <Space>
                  <Switch
                    checked={badge.autoAward}
                    disabled={!hasCriteria}
                    loading={isUpdating}
                    onChange={handleToggleAutoAward}
                  />
                  <Text strong>
                    {badge.autoAward ? 'Auto-award is on' : 'Auto-award is off'}
                  </Text>
                </Space>
                <Text type="secondary">
                  {!hasCriteria
                    ? 'Add at least one criterion before enabling auto-award.'
                    : automaticCriteriaCount === 0
                      ? 'Legacy criteria do not count as automatic criteria. Add a new criterion before enabling auto-award.'
                      : badge.autoAward
                        ? 'The badge is awarded automatically when every criterion is met.'
                        : 'Turn on to award this badge automatically when every criterion is met.'}
                </Text>
                {badge.autoAward && (
                  <Text type="secondary">
                    Turn auto-award off before deleting the last automatic
                    criterion.
                  </Text>
                )}
              </Space>
            </section>
          </Space>
        )}
      </Drawer>

      {badge && (
        <BadgeCriterionDrawer
          open={criterionDrawerOpen}
          onClose={() => setCriterionDrawerOpen(false)}
          badgeId={badge._id}
          badgeName={badge.name}
          autoAward={badge.autoAward}
          criterion={editingCriterion}
          onSaved={() => {
            void refetch();
            onSaved?.();
          }}
        />
      )}
    </>
  );
}
