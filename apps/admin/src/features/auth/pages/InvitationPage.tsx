import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Typography,
  Alert,
} from "antd";
import { useApi } from "@/hooks/useApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function InviteAdminPage() {
  const [form] = Form.useForm();
  const { post, loading } = useApi();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setError(null);
    const res = await post({
      url: "/adminstrator/send-invite",
      body: values,
    });

    if (!res) {
      setError("Invitation failed. Please try again.");
      return;
    }

    if (res.success) {
      message.success(res.message || "Invite sent!");
      setSent(true);
      form.resetFields();
    } else {
      setError(res.message || "Invitation failed");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "var(--white)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", color: "var(--dark)" }}>
          Invite Admin / Coordinator
        </Title>

        {sent && (
          <Text
            type="success"
            style={{ display: "block", textAlign: "center", marginBottom: 16 }}
          >
            Invite sent successfully!
          </Text>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="targetEmail"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input
              placeholder="Enter email"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: "Select a role" }]}
          >
            <Select placeholder="Select role" size="large">
              <Option value="admin">Admin</Option>
              <Option value="coordinator">Coordinator</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              background: "var(--primary)",
              borderColor: "var(--primary)",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Send Invite
          </Button>
        </Form>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginTop: 16 }}
        >
          <a href="/signup" style={{ color: "var(--accent)" }}>
            Go to Signup
          </a>
        </Text>
      </Card>
    </div>
  );
}
