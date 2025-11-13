import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Tag,
  Typography,
  Select,
} from "antd";
import { useState, useEffect } from "react"; // ← Only this
import { SafetyOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { IAssessmentSetup } from "@/hooks/useAssessmentSetups";
import { useAssessmentTypes } from "@/hooks/useAssessmentTypes";

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface AssessmentSetupDrawerProps {
  open: boolean;
  onClose: () => void;
  setup: IAssessmentSetup | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

export const AssessmentSetupDrawer = ({
  open,
  onClose,
  setup,
  mode,
  form,
  onSubmit,
  loading,
}: AssessmentSetupDrawerProps) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const { types } = useAssessmentTypes();

  // === LOCAL STATE FOR SELECTED TYPES ===
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(
    setup?.assessmentTypeIds || []
  );

  // === SYNC FORM WITH STATE ON MOUNT & EDIT ===
  useEffect(() => {
    if (setup && isEdit) {
      setSelectedTypeIds(setup.assessmentTypeIds);
      form.setFieldsValue({ assessmentTypeIds: setup.assessmentTypeIds });
    } else if (!setup) {
      setSelectedTypeIds([]);
      form.setFieldsValue({ assessmentTypeIds: [] });
    }
  }, [setup, form, isEdit]);

  // === LIVE WEIGHT SUM ===
  const totalWeight = types
    .filter((t) => selectedTypeIds.includes(t._id))
    .reduce((sum, t) => sum + t.weight, 0);

  // === HANDLE SELECT CHANGE ===
  const handleTypeChange = (value: string[]) => {
    setSelectedTypeIds(value);
    form.setFieldsValue({ assessmentTypeIds: value }); // Keep form valid
  };

  // === HANDLE SUBMIT (validate + call parent) ===
  const handleSubmit = async () => {
    try {
      // Validate name/description
      await form.validateFields(["name", "description"]);
      // Manually validate types
      if (selectedTypeIds.length === 0) {
        form.setFields([
          {
            name: "assessmentTypeIds",
            errors: ["Select at least one type"],
          },
        ]);
        return;
      }
      if (totalWeight !== 100) {
        form.setFields([
          {
            name: "assessmentTypeIds",
            errors: [`Total weight must be 100%. Current: ${totalWeight}%`],
          },
        ]);
        return;
      }
      // Clear errors
      form.setFields([{ name: "assessmentTypeIds", errors: [] }]);
      // Call parent onSubmit
      onSubmit();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "—";

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={48}
            icon={<SafetyOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          {isView
            ? setup?.name || "Assessment Setup"
            : setup
            ? "Edit Assessment Setup"
            : "Add New Assessment Setup"}
        </Space>
      }
      width={640}
      onClose={onClose}
      open={open}
      extra={
        isEdit && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={totalWeight !== 100}
            >
              {setup ? "Update" : "Create"}
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
          name: setup?.name || "",
          description: setup?.description || "",
          assessmentTypeIds: setup?.assessmentTypeIds || [],
        }}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Setup Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="e.g., Final Grade 2025" />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Optional description..."
            rows={3}
            showCount
            maxLength={300}
          />
        </Form.Item>

        {/* Assessment Types */}
        <Form.Item
          name="assessmentTypeIds"
          label="Assessment Types"
          rules={[{ required: true, message: "Select at least one type" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select assessment types..."
            value={selectedTypeIds}
            onChange={handleTypeChange}
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {types.map((type) => (
              <Option key={type._id} value={type._id} label={type.name}>
                <Space>
                  <Text>{type.name}</Text>
                  <Tag color="var(--primary)" style={{ margin: 0 }}>
                    {type.weight}%
                  </Tag>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Live Weight Indicator */}
        {!isView && (
          <Form.Item label="Total Weight">
            <Space>
              <Text strong>{totalWeight}%</Text>
              <Text type={totalWeight === 100 ? "success" : "danger"}>
                / 100%
              </Text>
              {totalWeight !== 100 && (
                <Text type="secondary" italic>
                  (Must equal 100%)
                </Text>
              )}
            </Space>
          </Form.Item>
        )}
        {/* View Mode Info */}
        {isView && (
          <>
            <Form.Item label="Types Included">
              <Space wrap>
                {setup?.assessmentTypeIds?.map((type: any) => (
                  <Tag key={type._id} color="var(--primary)">
                    {type.name} ({type.weight}%)
                  </Tag>
                ))}
              </Space>
            </Form.Item>

            <Form.Item label="Created">
              <Text>{formatDate(setup?.createdAt)}</Text>
            </Form.Item>
          </>
        )}
      </Form>

      {/* Fallback */}
      {isView && !setup?.description && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          No description provided.
        </Paragraph>
      )}
    </Drawer>
  );
};
