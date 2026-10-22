import { useEffect, useMemo } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
} from 'antd';
import type {
  BadgeCriteria,
  BadgeCriteriaType,
  BadgeCriterionCreateInput,
  BadgeCriterionInput,
  BadgeStreakMode,
} from '@carecraft/types';
import {
  BADGE_CRITERIA_TYPE_OPTIONS,
  getBadgeCriteriaTypeMeta,
  getBadgeCriteriaTypeNotes,
  getBadgeStreakModeLabel,
} from '@carecraft/badges';
import { useAttributeCategories } from '@/hooks/useAttributeCategories';
import { useSubjects } from '@/hooks/useSubjects';
import { useBadgeCriteria } from '@/hooks/useBadgeCriteria';

const { Text } = Typography;
const { TextArea } = Input;

const scopeOptions = [
  { value: 'term', label: 'Term' },
  { value: 'year', label: 'Year' },
];

const streakModeOptions: { value: BadgeStreakMode; label: string }[] = [
  { value: 'noAbsence', label: getBadgeStreakModeLabel('noAbsence') },
  { value: 'onTime', label: getBadgeStreakModeLabel('onTime') },
];

interface BadgeCriterionDrawerProps {
  open: boolean;
  onClose: () => void;
  badgeId: string;
  badgeName: string;
  autoAward: boolean;
  criterion: BadgeCriteria | null;
  onSaved: () => void;
}

function readObjectId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

function buildPayload(
  type: BadgeCriteriaType,
  values: Record<string, unknown>,
): BadgeCriterionInput {
  const description =
    typeof values.description === 'string' && values.description.trim()
      ? values.description.trim()
      : undefined;

  switch (type) {
    case 'attributeAverage':
      return {
        type,
        description,
        attributeCategoryId: (values.attributeCategoryId as string) || null,
        minScore: Number(values.minScore),
        minEvaluationCount: Number(values.minEvaluationCount),
        scope: values.scope as 'term' | 'year',
      };
    case 'attendanceRate':
      return {
        type,
        description,
        minPercentage: Number(values.minPercentage),
        minRecordedSchoolDays: Number(values.minRecordedSchoolDays),
        scope: values.scope as 'term' | 'year',
      };
    case 'attendanceStreak':
      return {
        type,
        description,
        mode: values.mode as BadgeStreakMode,
        minDays: Number(values.minDays),
      };
    case 'academicAverage':
      return {
        type,
        description,
        minPercentage: Number(values.minPercentage),
        subjectId: (values.subjectId as string) || null,
        scope: values.scope as 'term' | 'year',
      };
    case 'academicImprovement':
      return {
        type,
        description,
        minPoints: Number(values.minPoints),
      };
    case 'academicConsistency':
      return {
        type,
        description,
        minPercentage: Number(values.minPercentage),
      };
  }
}

export function BadgeCriterionDrawer({
  open,
  onClose,
  badgeId,
  badgeName,
  autoAward,
  criterion,
  onSaved,
}: BadgeCriterionDrawerProps) {
  const [form] = Form.useForm();
  const isEditing = Boolean(criterion);
  const { create, update, isCreating, isUpdating } = useBadgeCriteria({
    badgeDefinitionId: badgeId,
  });
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { categories, isLoading: categoriesLoading } = useAttributeCategories({
    all: true,
  });

  const selectedType = Form.useWatch('type', form) as
    | BadgeCriteriaType
    | undefined;
  const selectedAttributeCategoryId = Form.useWatch(
    'attributeCategoryId',
    form,
  ) as string | null | undefined;

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({ value: subject._id, label: subject.name })),
    [subjects],
  );

  const attributeCategoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories],
  );

  const selectedCategory = categories.find(
    (category) => category._id === selectedAttributeCategoryId,
  );

  const overallScale = useMemo(() => {
    if (categories.length === 0) return null;
    return {
      min: Math.min(...categories.map((category) => category.minScore)),
      max: Math.max(...categories.map((category) => category.maxScore)),
    };
  }, [categories]);

  const minScoreScale = selectedCategory
    ? { min: selectedCategory.minScore, max: selectedCategory.maxScore }
    : overallScale;

  useEffect(() => {
    if (!open) return;

    if (criterion) {
      const record = criterion as unknown as Record<string, unknown>;
      form.setFieldsValue({
        type: criterion.type,
        description: criterion.description ?? '',
        attributeCategoryId: readObjectId(record.attributeCategoryId),
        minScore: record.minScore ?? null,
        minEvaluationCount: record.minEvaluationCount ?? null,
        minPercentage: record.minPercentage ?? null,
        minRecordedSchoolDays: record.minRecordedSchoolDays ?? null,
        subjectId: readObjectId(record.subjectId),
        mode: record.mode ?? null,
        minDays: record.minDays ?? null,
        minPoints: record.minPoints ?? null,
        scope: record.scope ?? null,
      });
    } else {
      form.resetFields();
    }
  }, [criterion, form, open]);

  const handleTypeChange = () => {
    form.setFieldsValue({
      attributeCategoryId: null,
      minScore: null,
      minEvaluationCount: null,
      minPercentage: null,
      minRecordedSchoolDays: null,
      subjectId: null,
      mode: null,
      minDays: null,
      minPoints: null,
      scope: null,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const type = values.type as BadgeCriteriaType;
      const payload = buildPayload(type, values);

      if (criterion) {
        await update(criterion._id, payload, badgeId);
      } else {
        await create({
          ...payload,
          badgeDefinitionId: badgeId,
        } as BadgeCriterionCreateInput);
      }

      onSaved();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) return;
      // Backend validation messages are shown by useApi.
    }
  };

  const notes = getBadgeCriteriaTypeNotes(selectedType);
  const selectedMeta = getBadgeCriteriaTypeMeta(selectedType);
  const scoreRangeHint =
    minScoreScale !== null
      ? selectedCategory
        ? `Allowed score for ${selectedCategory.name}: ${minScoreScale.min} to ${minScoreScale.max}.`
        : `Allowed score across all attribute categories: ${minScoreScale.min} to ${minScoreScale.max}.`
      : 'Create an attribute category before using an attribute average criterion.';

  const renderFields = () => {
    switch (selectedType) {
      case 'attributeAverage':
        return (
          <>
            <Form.Item
              name="attributeCategoryId"
              label="Attribute category"
              extra="Leave blank to use the average across all attribute categories."
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="All attribute categories"
                options={attributeCategoryOptions}
                loading={categoriesLoading}
              />
            </Form.Item>
            <Form.Item
              name="minScore"
              label="Minimum average score"
              rules={[
                { required: true, message: 'Minimum score is required' },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === '') {
                      return Promise.resolve();
                    }
                    const numericValue = Number(value);
                    if (!Number.isFinite(numericValue)) {
                      return Promise.reject(new Error('Enter a valid score'));
                    }
                    if (minScoreScale && numericValue < minScoreScale.min) {
                      return Promise.reject(
                        new Error(
                          `Score must be at least ${minScoreScale.min}`,
                        ),
                      );
                    }
                    if (minScoreScale && numericValue > minScoreScale.max) {
                      return Promise.reject(
                        new Error(
                          `Score must be at most ${minScoreScale.max}`,
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              extra={scoreRangeHint}
            >
              <InputNumber
                min={minScoreScale?.min}
                max={minScoreScale?.max}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="e.g., 4"
              />
            </Form.Item>
            <Form.Item
              name="minEvaluationCount"
              label="Minimum evaluation count"
              rules={[
                {
                  required: true,
                  message: 'Minimum evaluation count is required',
                },
                {
                  type: 'integer',
                  min: 1,
                  max: 1000,
                  message: 'Enter a whole number from 1 to 1000',
                },
              ]}
              extra="This prevents an award from a tiny sample, such as one evaluation."
            >
              <InputNumber
                min={1}
                max={1000}
                precision={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="scope"
              label="Scope"
              rules={[{ required: true, message: 'Scope is required' }]}
            >
              <Select options={scopeOptions} placeholder="Select scope" />
            </Form.Item>
          </>
        );

      case 'attendanceRate':
        return (
          <>
            <Form.Item
              name="minPercentage"
              label="Minimum attendance (%)"
              rules={[
                { required: true, message: 'Minimum attendance is required' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: 'Enter a value from 0 to 100',
                },
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="e.g., 95"
              />
            </Form.Item>
            <Form.Item
              name="minRecordedSchoolDays"
              label="Minimum recorded school days"
              rules={[
                {
                  required: true,
                  message: 'Minimum recorded school days is required',
                },
                {
                  type: 'integer',
                  min: 1,
                  max: 366,
                  message: 'Enter a whole number from 1 to 366',
                },
              ]}
              extra="This prevents an award from a tiny sample, such as one recorded day."
            >
              <InputNumber
                min={1}
                max={366}
                precision={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="scope"
              label="Scope"
              rules={[{ required: true, message: 'Scope is required' }]}
            >
              <Select options={scopeOptions} placeholder="Select scope" />
            </Form.Item>
          </>
        );

      case 'attendanceStreak':
        return (
          <>
            <Form.Item
              name="mode"
              label="Streak mode"
              rules={[{ required: true, message: 'Streak mode is required' }]}
            >
              <Select
                options={streakModeOptions}
                placeholder="Select streak mode"
              />
            </Form.Item>
            <Form.Item
              name="minDays"
              label="Minimum streak (recorded school days)"
              rules={[
                { required: true, message: 'Minimum streak is required' },
                {
                  type: 'integer',
                  min: 1,
                  max: 366,
                  message: 'Enter a whole number from 1 to 366',
                },
              ]}
            >
              <InputNumber
                min={1}
                max={366}
                precision={0}
                style={{ width: '100%' }}
                placeholder="e.g., 20"
              />
            </Form.Item>
          </>
        );

      case 'academicAverage':
        return (
          <>
            <Form.Item
              name="subjectId"
              label="Subject"
              extra="Leave blank to use the overall academic average."
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Overall average"
                options={subjectOptions}
                loading={subjectsLoading}
              />
            </Form.Item>
            <Form.Item
              name="minPercentage"
              label="Minimum academic average (%)"
              rules={[
                { required: true, message: 'Minimum average is required' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: 'Enter a value from 0 to 100',
                },
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="e.g., 85"
              />
            </Form.Item>
            <Form.Item
              name="scope"
              label="Scope"
              rules={[{ required: true, message: 'Scope is required' }]}
            >
              <Select options={scopeOptions} placeholder="Select scope" />
            </Form.Item>
          </>
        );

      case 'academicImprovement':
        return (
          <Form.Item
            name="minPoints"
            label="Minimum improvement (percentage points)"
            rules={[
              { required: true, message: 'Minimum improvement is required' },
              {
                validator: (_, value) =>
                  value === undefined ||
                  value === null ||
                  (Number(value) > 0 && Number(value) <= 100)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error('Enter a value above 0 and up to 100'),
                      ),
              },
            ]}
            extra="The current term is compared with the previous term of the same year. Both terms must be fully locked."
          >
            <InputNumber
              min={0.01}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="e.g., 5"
            />
          </Form.Item>
        );

      case 'academicConsistency':
        return (
          <Form.Item
            name="minPercentage"
            label="Minimum average in every subject (%)"
            rules={[
              { required: true, message: 'Minimum average is required' },
              {
                type: 'number',
                min: 0,
                max: 100,
                message: 'Enter a value from 0 to 100',
              },
            ]}
            extra="Every subject with a setup for the current term must be fully locked."
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="e.g., 80"
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title={isEditing ? 'Edit criterion' : 'Add criterion'}
      width={640}
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isCreating || isUpdating}
          >
            {isEditing ? 'Save criterion' : 'Add criterion'}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text type="secondary">
          Badge: <Text strong>{badgeName}</Text>
        </Text>

        {autoAward && (
          <Alert
            type="info"
            showIcon
            message="Auto-award is on"
            description="This badge must keep at least one automatic criterion. Turn auto-award off before removing its last criterion."
          />
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Criterion type"
            rules={[{ required: true, message: 'Select a criterion type' }]}
            extra={
              isEditing
                ? 'The type cannot be changed. Delete this criterion and create a new one to use a different type.'
                : 'Only fields for the selected type are sent to the backend.'
            }
          >
            <Select
              placeholder="Select criterion type"
              disabled={isEditing}
              onChange={handleTypeChange}
              options={BADGE_CRITERIA_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              optionRender={(option) => {
                const meta = getBadgeCriteriaTypeMeta(
                  String(option.value) as BadgeCriteriaType,
                );
                return (
                  <Space direction="vertical" size={0}>
                    <Text strong>{option.label}</Text>
                    {meta && <Text type="secondary">{meta.description}</Text>}
                  </Space>
                );
              }}
            />
          </Form.Item>

          {selectedMeta && (
            <Text
              type="secondary"
              style={{ display: 'block', marginTop: -12, marginBottom: 16 }}
            >
              {selectedMeta.description}
            </Text>
          )}

          {notes.length > 0 && (
            <Alert
              type="info"
              showIcon
              message="Rule notes"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          {renderFields()}

          <Form.Item name="description" label="Description (optional)">
            <TextArea
              placeholder="Any extra notes or clarification"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
        </Form>
      </Space>
    </Drawer>
  );
}
