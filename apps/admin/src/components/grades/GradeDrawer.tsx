import { Drawer, Descriptions, Form, Input, Button, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

export interface IGrade {
  _id: string;
  level: string;
  description?: string | null;
  createdAt?: Date | string; // ← Fixed: Date | string
  updatedAt?: Date | string; // ← Fixed: Date | string
}

interface GradeDrawerProps {
  open: boolean;
  onClose: () => void;
  grade: IGrade | null;
  mode: "view" | "edit";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export function GradeDrawer({
  open,
  onClose,
  grade,
  mode,
  form,
  onSubmit,
  loading = false,
}: GradeDrawerProps) {
  const isView = mode === "view";

  // Helper: format date
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{isView ? "Grade Details" : "Edit Grade"}</span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        !isView && (
          <div style={{ textAlign: "right", padding: "8px 0" }}>
            <Space>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" onClick={onSubmit} loading={loading}>
                Save
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Level">{grade?.level}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {grade?.description || (
              <em style={{ color: "var(--text-dark)", opacity: 0.5 }}>None</em>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(grade?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(grade?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Level is required" }]}
          >
            <Input placeholder="e.g. Grade 1" disabled={loading} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={4}
              placeholder="Optional"
              disabled={loading}
            />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
