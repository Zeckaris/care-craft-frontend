import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Tag,
  Typography,
} from "antd";
import { SafetyOutlined, UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { IAssessmentType } from "@/hooks/useAssessmentTypes";

const { Text, Paragraph } = Typography;

interface AssessmentTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  type: IAssessmentType | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

export const AssessmentTypeDrawer = ({
  open,
  onClose,
  type,
  mode,
  form,
  onSubmit,
  loading,
}: AssessmentTypeDrawerProps) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";

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
            ? type?.name || "Assessment Type"
            : type
            ? "Edit Assessment Type"
            : "Add New Assessment Type"}
        </Space>
      }
      width={640}
      onClose={onClose}
      open={open}
      extra={
        isEdit && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {type ? "Update" : "Create"}
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
          name: type?.name || "",
          weight: type?.weight ?? undefined,
          description: type?.description || "",
        }}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Assessment Type Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="e.g., Midterm Exam" />
        </Form.Item>

        {/* Weight */}
        <Form.Item
          name="weight"
          label="Weight (%)"
          rules={[
            { required: true, message: "Weight is required" },
            {
              validator: (_, value) =>
                value >= 0 && value <= 100
                  ? Promise.resolve()
                  : Promise.reject(new Error("Weight must be 0–100")),
            },
          ]}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="75"
            style={{ width: "100%" }}
            addonAfter="%"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Optional description..."
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* View Mode Info */}
        {isView && (
          <>
            <Form.Item label="Weight">
              <Tag color="var(--primary)" style={{ fontWeight: 500 }}>
                {type?.weight}%
              </Tag>
            </Form.Item>

            <Form.Item label="Created">
              <Text>{formatDate(type?.createdAt)}</Text>
            </Form.Item>

            <Form.Item label="Last Updated">
              <Text>{formatDate(type?.updatedAt)}</Text>
            </Form.Item>
          </>
        )}
      </Form>

      {/* Fallback for no description in view mode */}
      {isView && !type?.description && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          No description provided.
        </Paragraph>
      )}
    </Drawer>
  );
};
