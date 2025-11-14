import { Drawer, Form, Input, Button, Space, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserEditDrawerProps {
  open: boolean;
  onClose: () => void;
  user: IUser | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

export const UserEditDrawer = ({
  open,
  onClose,
  user,
  mode,
  form,
  onSubmit,
  loading,
}: UserEditDrawerProps) => {
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
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          {isView
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "User Details"
            : user
            ? "Edit User"
            : "User"}
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
              {user ? "Update" : "Save"}
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
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
        }}
      >
        {/* First Name */}
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input placeholder="e.g., John" />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input placeholder="e.g., Doe" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="e.g., john.doe@example.com" />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item name="phoneNumber" label="Phone Number">
          <Input placeholder="e.g., +1234567890" />
        </Form.Item>

        {/* Read-only Info (View Mode Only) */}
        {isView && (
          <>
            <Form.Item label="Created">
              <Text>{formatDate(user?.createdAt)}</Text>
            </Form.Item>

            <Form.Item label="Last Login">
              <Text>{formatDate(user?.lastLogin)}</Text>
            </Form.Item>

            <Form.Item label="Last Updated">
              <Text>{formatDate(user?.updatedAt)}</Text>
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};
