import { Drawer, Form, Input, Button, Space, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { useEffect } from "react";
import type { ISubject } from "@/hooks/useSubjects";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { formatDateTime } from "@/utils/dateFormat";

const { Paragraph } = Typography;

interface SubjectDrawerProps {
  open: boolean;
  onClose: () => void;
  subject: ISubject | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

export const SubjectDrawer = ({
  open,
  onClose,
  subject,
  mode,
  form,
  onSubmit,
  loading,
}: SubjectDrawerProps) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (open && subject) {
      form.setFieldsValue({
        name: subject.name,
        description: subject.description || "",
      });
    }
  }, [open, subject, isView, form]);

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={48}
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          {isView
            ? subject?.name || "Subject Details"
            : subject
            ? "Edit Subject"
            : "Add New Subject"}
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
              {subject ? "Update" : "Create"}
            </Button>
          </Space>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isView}
        className={isView ? "cc-readonly-form" : undefined}
        initialValues={{
          name: subject?.name || "",
          description: subject?.description || "",
        }}
      >
        {/* Subject Name */}
        <Form.Item
          name="name"
          label="Subject Name"
          rules={[{ required: true, message: "Subject name is required" }]}
        >
          <Input placeholder="e.g., Mathematics" />
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

        {/* Read-only Info (View Mode Only) */}
        {isView && (
          <>
            <ReadOnlyField
              label="Created"
              value={formatDateTime(subject?.createdAt)}
            />

            <ReadOnlyField
              label="Last Updated"
              value={formatDateTime(subject?.updatedAt)}
            />
          </>
        )}
      </Form>

      {/* Empty state hint in view mode if no description */}
      {isView && !subject?.description && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          No description provided.
        </Paragraph>
      )}
    </Drawer>
  );
};
