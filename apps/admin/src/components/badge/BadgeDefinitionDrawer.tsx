import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Upload,
  Select,
  Typography,
} from "antd";
import { UploadOutlined, TrophyOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { useState, useEffect } from "react";
import type { BadgeDefinition } from "@carecraft/types";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { formatDateTime } from "@/utils/dateFormat";
import {
  BADGE_LEVEL_OPTIONS,
  getBadgeCriteriaTypeLabel,
  getBadgeLevelLabel,
  getEligibleGradeLabels,
  normalizeEligibleGradeIds,
} from "@/utils/badges";

const { Text } = Typography;
const { TextArea } = Input;

interface BadgeDefinitionDrawerProps {
  open: boolean;
  onClose: () => void;
  definition: BadgeDefinition | null;
  mode: "view" | "create" | "edit";
  form: FormInstance;
  onSubmit: (
    values: {
      name: string;
      description: string;
      howToEarn: string;
      level: number;
      eligibleGrades: string[];
    },
    iconFile: File | null,
  ) => void;
  loading?: boolean;
  gradeOptions?: { value: string; label: string }[];
  levelOptions?: { value: number; label: string }[];
}

export const BadgeDefinitionDrawer = ({
  open,
  onClose,
  definition,
  mode,
  form,
  onSubmit,
  loading = false,
  gradeOptions = [],
  levelOptions = BADGE_LEVEL_OPTIONS,
}: BadgeDefinitionDrawerProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>(
    definition?.icon || "",
  );

  useEffect(() => {
    if (open) {
      setIconPreview(definition?.icon || "");
      setIconFile(null);
    }
  }, [open, mode, definition]);

  const handleUploadChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj as File;
    if (file) {
      setIconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };

  const handleClose = () => {
    if (iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(null);
    setIconPreview("");
    onClose();
  };

  const handleDrawerSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(
          {
            name: values.name,
            description: values.description,
            howToEarn: values.howToEarn ?? "",
            level: values.level,
            eligibleGrades: values.eligibleGrades || [],
          },
          iconFile,
        );
      })
      .catch(() => {
        // Validation messages are shown by the form.
      });
  };

  const handleSelectAllGrades = () => {
    form.setFieldsValue({
      eligibleGrades: gradeOptions.map((option) => option.value),
    });
  };

  const levelOptionsWithCurrent =
    definition && !levelOptions.some((option) => option.value === definition.level)
      ? [
          ...levelOptions,
          { value: definition.level, label: `Level ${definition.level}` },
        ]
      : levelOptions;

  const eligibleGradeIds = normalizeEligibleGradeIds(definition?.eligibleGrades);
  const gradeLabelById = new Map(
    gradeOptions.map((option) => [option.value, option.label]),
  );
  const eligibleGradeLabels = getEligibleGradeLabels(
    definition?.eligibleGrades,
    gradeLabelById,
  ).join(", ");
  const criteriaSummary = definition?.criteria?.length
    ? definition.criteria
        .map((criterion) => getBadgeCriteriaTypeLabel(criterion.type))
        .join(", ")
    : "No criteria";

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={48}
            icon={<TrophyOutlined />}
            src={iconPreview || undefined}
            style={{ backgroundColor: "#f56a00" }}
          />
          {isView
            ? definition?.name || "Badge Details"
            : isCreate
              ? "Create New Badge Definition"
              : "Edit Badge Definition"}
        </Space>
      }
      width={680}
      onClose={handleClose}
      open={open}
      destroyOnClose
      extra={
        !isView && (
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleDrawerSubmit}
              loading={loading}
            >
              {isCreate ? "Create" : "Update"}
            </Button>
          </Space>
        )
      }
    >
      {isView ? (
        <Form layout="vertical" disabled>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item label="Badge Icon">
              <Space
                direction="vertical"
                align="center"
                style={{ width: "100%" }}
              >
                <Avatar
                  size={120}
                  icon={<TrophyOutlined />}
                  src={iconPreview || undefined}
                  style={{ backgroundColor: "#f56a00" }}
                />
                {!iconPreview && <Text type="secondary">No icon set</Text>}
              </Space>
            </Form.Item>

            <ReadOnlyField label="Badge Name" value={definition?.name} />
            <ReadOnlyField
              label="Level"
              value={getBadgeLevelLabel(definition?.level)}
            />
            <ReadOnlyField label="Description" value={definition?.description} />
            <ReadOnlyField
              label="How to Earn"
              value={definition?.howToEarn}
            />
            <ReadOnlyField
              label="Eligible Grades"
              value={eligibleGradeLabels || "No eligible grades"}
            />
            <ReadOnlyField
              label="Auto Award"
              value={definition?.autoAward ? "Enabled" : "Disabled"}
            />
            <ReadOnlyField label="Criteria" value={criteriaSummary} />
            <ReadOnlyField
              label="Created By"
              value={
                definition?.createdBy && typeof definition.createdBy !== "string"
                  ? `${definition.createdBy.firstName} ${definition.createdBy.lastName}`
                  : "-"
              }
            />
            <ReadOnlyField
              label="Created"
              value={formatDateTime(definition?.createdAt)}
            />
            <ReadOnlyField
              label="Last Updated"
              value={formatDateTime(definition?.updatedAt)}
            />
          </Space>
        </Form>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: definition?.name || "",
            description: definition?.description || "",
            howToEarn: definition?.howToEarn || "",
            level: definition?.level || 1,
            eligibleGrades: eligibleGradeIds,
          }}
        >
          <Form.Item label="Badge Icon (optional)">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
              <Avatar
                size={120}
                icon={<TrophyOutlined />}
                src={iconPreview || undefined}
                style={{ backgroundColor: "#f56a00" }}
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUploadChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  {iconFile ? "Change Icon" : "Upload Icon"}
                </Button>
              </Upload>
              <Text type="secondary">
                Recommended: square image (e.g., 256x256)
              </Text>
            </Space>
          </Form.Item>

          <Space style={{ display: "flex" }} size="large">
            <Form.Item
              name="name"
              label="Badge Name"
              rules={[{ required: true, message: "Badge name is required" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="e.g., Communication Excellence" />
            </Form.Item>

            <Form.Item
              name="level"
              label="Level"
              rules={[{ required: true, message: "Level is required" }]}
            >
              <Select
                options={levelOptionsWithCurrent}
                style={{ width: 180 }}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea
              placeholder="Describe what this badge represents and why it is awarded..."
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="howToEarn"
            label="How to Earn"
            extra="Optional. Shown to teachers and students. Up to 500 characters."
          >
            <TextArea
              maxLength={500}
              showCount
              placeholder="Explain how a student can earn this badge"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <span>Eligible Grades</span>
                <Button
                  type="link"
                  size="small"
                  onClick={handleSelectAllGrades}
                  disabled={gradeOptions.length === 0}
                >
                  Select all grades
                </Button>
              </Space>
            }
            name="eligibleGrades"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: "Select at least one eligible grade",
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

          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            {isCreate
              ? "After creating the badge, its detail drawer opens so you can add criteria or leave it teacher-awarded."
              : "Criteria and auto-award are managed from the badge detail drawer."}
          </Text>
        </Form>
      )}
    </Drawer>
  );
};
