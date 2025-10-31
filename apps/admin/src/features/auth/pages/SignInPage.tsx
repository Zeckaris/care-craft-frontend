// src/features/auth/pages/SignInPage.tsx
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLogin } from "@/hooks/useLogin";

const { Title, Text } = Typography;

export default function SignInPage() {
  const [form] = useForm();
  const { login, loading, error, setError } = useLogin();

  const onFinish = async (values: { email: string; password: string }) => {
    const user = await login(values.email, values.password);
    if (user) {
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 16px" }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "var(--white)",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            color: "var(--dark)",
            marginBottom: 24,
          }}
        >
          Sign In
        </Title>

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

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="Password" size="large" />
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
            Sign In
          </Button>
        </Form>

        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginTop: 16 }}
        >
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "var(--accent)" }}>
            Sign up
          </a>
        </Text>
      </Card>
    </div>
  );
}
