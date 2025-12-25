import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Typography,
  Divider,
} from "antd";
import type { FormInstance } from "antd";
import { useEffect } from "react";
import type { IBadgeCriteria } from "@/hooks/useBadgeCriteria";
import type { IBadgeDefinition } from "@/hooks/useBadgeDefinitions";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface BadgeCriteriaDrawerProps {
  open: boolean;
  onClose: () => void;
  criteria: IBadgeCriteria | null;
  mode: "view" | "create" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
  badgeDefinitions: IBadgeDefinition[];
  attributeCategoryOptions?: { value: string; label: string }[];
}

const criteriaTypes = [
  { value: "scoreThreshold", label: "Score Threshold" },
  { value: "actionPlanProgress", label: "Action Plan Progress" },
  { value: "observationCount", label: "Observation Count" },
  { value: "custom", label: "Custom" },
  {
    value: "attributeEvaluationAverage",
    label: "Attribute Evaluation Average",
  },
];

export const BadgeCriteriaDrawer = ({
  open,
  onClose,
  criteria,
  mode,
  form,
  onSubmit,
  loading = false,
  badgeDefinitions,
  attributeCategoryOptions = [],
}: BadgeCriteriaDrawerProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const selectedType = Form.useWatch("type", form);

  // Reset conditional fields when type changes
  useEffect(() => {
    if (!isView) {
      form.setFieldsValue({
        attributeCategoryId: null,
        minScore: null,
        actionPlanId: null,
        minProgress: null,
        minObservations: null,
        scope: null,
      });
    }
  }, [selectedType, form, isView]);

  const badgeOptions = badgeDefinitions.map((bd) => ({
    value: bd._id,
    label: `${bd.name} (Level ${bd.level})`,
  }));

  const renderConditionalFields = () => {
    if (isView) {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          {criteria?.minScore && <Tag>Min Score: {criteria.minScore}</Tag>}
          {criteria?.minProgress && (
            <Tag>Min Progress: {criteria.minProgress}%</Tag>
          )}
          {criteria?.minObservations && (
            <Tag>Min Observations: {criteria.minObservations}</Tag>
          )}
          {criteria?.scope && (
            <Tag>
              Scope: {criteria.scope === "yearly" ? "Yearly" : "All Time"}
            </Tag>
          )}
        </Space>
      );
    }

    switch (selectedType) {
      case "scoreThreshold":
        return (
          <>
            <Form.Item
              name="attributeCategoryId"
              label="Attribute Category"
              rules={[
                { required: true, message: "Required for score threshold" },
              ]}
            >
              <Select
                placeholder="Select attribute category"
                options={attributeCategoryOptions}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="minScore"
              label="Minimum Score"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="number" min={0} max={100} />
            </Form.Item>
          </>
        );

      case "attributeEvaluationAverage":
        return (
          <>
            <Form.Item
              name="minScore"
              label="Minimum Average Score"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="number" min={0} max={100} />
            </Form.Item>
            <Form.Item
              name="scope"
              label="Scope"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                options={[
                  { value: "yearly", label: "Yearly" },
                  { value: "allTime", label: "All Time" },
                ]}
              />
            </Form.Item>
          </>
        );

      case "actionPlanProgress":
        return (
          <>
            <Form.Item
              name="actionPlanId"
              label="Action Plan"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                placeholder="Select action plan (coming soon)"
                disabled
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="minProgress"
              label="Minimum Progress (%)"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="number" min={0} max={100} />
            </Form.Item>
          </>
        );

      case "observationCount":
        return (
          <>
            <Form.Item
              name="attributeCategoryId"
              label="Attribute Category"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                placeholder="Select attribute category"
                options={attributeCategoryOptions}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="minObservations"
              label="Minimum Observations"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="number" min={1} />
            </Form.Item>
          </>
        );

      case "custom":
        return (
          <Form.Item
            name="description"
            label="Custom Description"
            rules={[
              { required: true, message: "Description is required for custom" },
            ]}
          >
            <TextArea
              placeholder="Describe the custom requirement..."
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title={
        isView
          ? "Criteria Details"
          : isCreate
          ? "Create New Criteria"
          : "Edit Criteria"
      }
      width={680}
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        !isView && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {isCreate ? "Create" : "Update"}
            </Button>
          </Space>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isView}
        initialValues={{
          badgeDefinitionId: criteria?.badgeDefinitionId || undefined,
          type: criteria?.type || undefined,
          description: criteria?.description || "",
          attributeCategoryId: criteria?.attributeCategoryId || null,
          minScore: criteria?.minScore || null,
          actionPlanId: criteria?.actionPlanId || null,
          minProgress: criteria?.minProgress || null,
          minObservations: criteria?.minObservations || null,
          scope: criteria?.scope || null,
        }}
      >
        {/* Badge Definition */}
        <Form.Item
          name="badgeDefinitionId"
          label="Belongs to Badge"
          rules={[
            { required: true, message: "Please select a badge definition" },
          ]}
        >
          {isView ? (
            <Text>
              {badgeDefinitions.find(
                (bd) => bd._id === criteria?.badgeDefinitionId
              )?.name || "Unknown Badge"}
            </Text>
          ) : (
            <Select
              placeholder="Select badge definition"
              options={badgeOptions}
              showSearch
              optionFilterProp="label"
            />
          )}
        </Form.Item>

        {/* Type */}
        <Form.Item
          name="type"
          label="Criteria Type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          {isView ? (
            <Tag>
              {criteriaTypes.find((t) => t.value === criteria?.type)?.label ||
                criteria?.type}
            </Tag>
          ) : (
            <Select
              placeholder="Select type"
              options={criteriaTypes}
              onChange={() => {
                form.setFieldsValue({
                  attributeCategoryId: null,
                  minScore: null,
                  actionPlanId: null,
                  minProgress: null,
                  minObservations: null,
                  scope: null,
                });
              }}
            />
          )}
        </Form.Item>

        {/* Conditional Fields */}
        {renderConditionalFields()}

        {/* General Description (optional except for custom) */}
        {selectedType && selectedType !== "custom" && (
          <Form.Item
            name="description"
            label="Additional Description (optional)"
          >
            <TextArea
              placeholder="Any extra notes or clarification..."
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
        )}

        {isView && criteria && (
          <>
            <Divider />
            <Space direction="vertical">
              <Text type="secondary">Created on:</Text>
              <Text>{new Date(criteria.createdAt).toLocaleDateString()}</Text>
            </Space>
          </>
        )}
      </Form>
    </Drawer>
  );
};
