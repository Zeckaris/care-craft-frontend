import {
  Drawer,
  Descriptions,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Tag,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicCalendar } from "@/hooks/useAcademicCalendars";

interface AcademicCalendarDrawerProps {
  open: boolean;
  onClose: () => void;
  calendar: IAcademicCalendar | null;
  mode: "view" | "edit";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export function AcademicCalendarDrawer({
  open,
  onClose,
  calendar,
  mode,
  form,
  onSubmit,
  loading = false,
}: AcademicCalendarDrawerProps) {
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
              ? "Academic Year Details"
              : calendar?._id
              ? "Edit Academic Year"
              : "Create Academic Year"}
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
                {calendar?._id ? "Update" : "Create"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Academic Year">
            <strong>{calendar?.academicYear}</strong>
            {calendar?.isCurrent && (
              <Tag color="green" style={{ marginLeft: 8 }}>
                CURRENT
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {formatDate(calendar?.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {formatDate(calendar?.endDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(calendar?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(calendar?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="academicYear"
            label="Academic Year"
            rules={[
              { required: true, message: "Academic year is required" },
              {
                pattern: /^\d{4}-\d{4}$/,
                message: "Format must be YYYY-YYYY (e.g. 2024-2025)",
              },
            ]}
          >
            <Input placeholder="2024-2025" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[
              { required: true, message: "Start date is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("endDate"))
                    return Promise.resolve();
                  if (dayjs(value).isBefore(dayjs(getFieldValue("endDate")))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Start date must be before end date")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD MMMM YYYY"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "End date is required" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD MMMM YYYY"
              disabled={loading}
            />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
