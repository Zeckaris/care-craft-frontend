import {
  Drawer,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { type IAttributeCategory } from "@/hooks/useAttributeCategories";

const { Text } = Typography;

interface AttributeCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  category: IAttributeCategory | null;
  mode: "view" | "edit" | "create";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export function AttributeCategoryDrawer({
  open,
  onClose,
  category,
  mode,
  form,
  onSubmit,
  loading = false,
}: AttributeCategoryDrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "-";

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
          <span>
            {isView
              ? "Attribute Category Details"
              : isCreate
              ? "Create Attribute Category"
              : "Edit Attribute Category"}
          </span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={520}
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
                {isCreate ? "Create" : "Save Changes"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">
            <Text strong>{category?.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {category?.description || (
              <em style={{ opacity: 0.6 }}>No description</em>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Score Range">
            <Text strong>
              {category?.minScore} – {category?.maxScore}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(category?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(category?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="e.g. Behavior, Punctuality"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Optional description..."
              disabled={loading}
            />
          </Form.Item>

          <Form.Item label="Score Range">
            <Space align="baseline">
              <Form.Item
                name="minScore"
                noStyle
                rules={[
                  { required: true, message: "Min score required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const max = getFieldValue("maxScore");
                      if (max !== undefined && value >= max) {
                        return Promise.reject(
                          new Error("Min must be less than Max")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="Min"
                  style={{ width: 120 }}
                  disabled={loading}
                />
              </Form.Item>

              <span style={{ margin: "0 8px" }}>–</span>

              <Form.Item
                name="maxScore"
                noStyle
                rules={[
                  { required: true, message: "Max score required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const min = getFieldValue("minScore");
                      if (min !== undefined && value <= min) {
                        return Promise.reject(
                          new Error("Max must be greater than Min")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="Max"
                  style={{ width: 120 }}
                  disabled={loading}
                />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
