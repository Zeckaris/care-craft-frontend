import {
  Drawer,
  Descriptions,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Tag,
  Switch,
  InputNumber,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicTerm } from "@/hooks/useAcademicTerms";

interface AcademicTermDrawerProps {
  open: boolean;
  onClose: () => void;
  term: IAcademicTerm | null;
  mode: "view" | "edit";
  form: any;
  onSubmit: (values: any) => void;
  loading?: boolean;
  academicYear?: string;
}

export function AcademicTermDrawer({
  open,
  onClose,
  term,
  mode,
  form,
  onSubmit,
  loading = false,
  academicYear,
}: AcademicTermDrawerProps) {
  const isView = mode === "view";

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "-";
    return dayjs(date).format("DD MMMM YYYY");
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
          <span>
            {isView
              ? "Term Details"
              : term?._id
              ? "Edit Term"
              : "Create New Term"}
            {academicYear && !isView && (
              <span style={{ marginLeft: 8, opacity: 0.7 }}>
                — {academicYear}
              </span>
            )}
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
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
              >
                {term?._id ? "Update" : "Create"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Term Name">
            <strong>{term?.name}</strong>
            {term?.isCurrent && (
              <Tag color="green" style={{ marginLeft: 8 }}>
                CURRENT
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {formatDate(term?.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {formatDate(term?.endDate)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="name"
            label="Term Name"
            rules={[{ required: true, message: "Please enter term name" }]}
          >
            <Input placeholder="e.g. Term 1, Semester 2" />
          </Form.Item>

          <Form.Item
            name="sequence"
            label="Sequence"
            rules={[
              { required: true, message: "Please enter sequence number" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 1, 2, 3..."
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD MMMM YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD MMMM YYYY" />
          </Form.Item>

          {/* CORRECT WAY TO ADD LABEL TO SWITCH */}
          {!term?._id && (
            <Form.Item
              name="isCurrent"
              valuePropName="checked"
              label="Set as Current Term"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          )}
        </Form>
      )}
    </Drawer>
  );
}
