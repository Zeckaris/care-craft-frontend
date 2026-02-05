import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  message,
  Spin,
  Divider,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";

const { Title, Text } = Typography;

export default function SignInPage() {
  const [form] = useForm();
  const { login, loading, error, setError } = useLogin();

  const [showMfaInput, setShowMfaInput] = useState(false);

  const handleTryDemo = () => {
    form.setFieldsValue({
      email: "test@example.com",
      password: "password123",
    });
    message.info("Demo credentials loaded! Click 'Sign In' to continue.");
  };

  const onFinish = async (values: {
    email: string;
    password: string;
    mfaCode?: string;
  }) => {
    setError(null);
    setShowMfaInput(false);

    const { email, password, mfaCode } = values;

    const result = await login(email, password, mfaCode);

    if (result && result.mfaRequired) {
      setShowMfaInput(true);
      message.info("A verification code has been sent to your email.");
      return;
    }

    if (result) {
      message.success("Login successful!");
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

        {/* ── NEW DEMO SECTION ── */}
        <div
          style={{
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 8,
            padding: "16px",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <Text
            strong
            style={{ display: "block", marginBottom: 8, color: "#389e0d" }}
          >
            Just exploring? Try the demo!
          </Text>
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            See the full dashboard in seconds — no signup required.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={handleTryDemo}
            block
            style={{
              background: "#52c41a",
              borderColor: "#52c41a",
              fontWeight: 600,
            }}
          >
            Load Demo Account
          </Button>
        </div>
        {/* ── END DEMO SECTION ── */}

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
            <Input placeholder="Email" size="large" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          {showMfaInput && (
            <Form.Item
              name="mfaCode"
              rules={[
                { required: true, message: "Verification code is required" },
              ]}
            >
              <Input
                placeholder="••••••"
                size="large"
                maxLength={6}
                style={{
                  textAlign: "center",
                  letterSpacing: "12px",
                  fontSize: "24px",
                  fontWeight: "600",
                  padding: "12px 8px",
                }}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "••••••")}
                disabled={loading}
              />
            </Form.Item>
          )}

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
              marginTop: showMfaInput ? 8 : 24,
            }}
          >
            {showMfaInput ? "Verify & Sign In" : "Sign In"}
          </Button>

          {loading && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Spin size="default" />
              <Text
                type="secondary"
                style={{ marginLeft: 12, display: "block", marginTop: 8 }}
              >
                {showMfaInput ? "Verifying code..." : "Signing you in..."}
              </Text>
            </div>
          )}
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
