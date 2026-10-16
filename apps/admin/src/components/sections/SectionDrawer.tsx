import {
  Drawer,
  Descriptions,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Tag,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { ISection } from "@carecraft/types";
import { useGrades } from "@/hooks/useGrades";

interface SectionDrawerProps {
  open: boolean;
  onClose: () => void;
  section: ISection | null;
  mode: "view" | "edit" | "create";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
  /** The current calendar's academicYear — used for defaulting the school year on create */
  currentYear?: string;
}

export function SectionDrawer({
  open,
  onClose,
  section,
  mode,
  form,
  onSubmit,
  loading = false,
  currentYear,
}: SectionDrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  const { grades, isLoading: gradesLoading } = useGrades();

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : "—";

  const title = isView
    ? "Section Details"
    : isCreate
    ? "Create Section"
    : "Edit Section";

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
          <span>{title}</span>
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
            <strong>{section?.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Grade">
            {section?.gradeId?.level ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="School Year">
            {section?.schoolYear ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={section?.isActive ? "green" : "red"}>
              {section?.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(section?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(section?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          {/* Grade — immutable after first save, so disable in edit mode */}
          <Form.Item
            name="gradeId"
            label="Grade"
            rules={[{ required: true, message: "Please select a grade" }]}
            extra={
              !isCreate
                ? "Grade cannot be changed after a section is created."
                : undefined
            }
          >
            <Select
              placeholder="Select grade"
              loading={gradesLoading}
              disabled={loading || !isCreate}
              showSearch
              optionFilterProp="children"
            >
              {grades.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* School Year — immutable after first save */}
          <Form.Item
            name="schoolYear"
            label="School Year"
            rules={[{ required: true, message: "School year is required" }]}
            extra={
              !isCreate
                ? "School year cannot be changed after a section is created."
                : currentYear
                ? `Current calendar year: ${currentYear}`
                : undefined
            }
          >
            <Input
              placeholder="e.g. 2024-25"
              disabled={loading || !isCreate}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Section Name"
            rules={[{ required: true, message: "Section name is required" }]}
          >
            <Input placeholder="e.g. Section A" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch disabled={loading} />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
