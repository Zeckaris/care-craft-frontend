import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Alert,
  message,
} from "antd";
import { useAdminSignup } from "@/hooks/useAdminSignup";
import { useVerifyEmail } from "@/hooks/useVerifyEmai";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AdminSignupPage() {
  const [form] = Form.useForm();
  const [codeSent, setCodeSent] = useState(false);
  const {
    loading: signupLoading,
    role,
    signup,
    isSignupSuccess,
  } = useAdminSignup();
  const [error, setError] = useState<string | null>(null);
  const {
    sendCode,
    loading: verifyLoading,
    canResend,
    countdown,
  } = useVerifyEmail();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignupSuccess) {
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSignupSuccess, navigate]);

  const onFinish = async (values: any) => {
    setError(null);
    if (values.password !== values.confirmPassword) {
      return message.error("Passwords do not match");
    }
    try {
      await signup(values);
    } catch (error) {
      setError("Signup failed. Check your invite token or try again()");
    }
  };

  const handleVerify = () => {
    const email = form.getFieldValue("email");
    if (!email) {
      message.error("Please enter your email");
      return;
    }
    sendCode(email);
    setCodeSent(true);
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
      <Card>
        <Title level={3} style={{ textAlign: "center", color: "#0B132B" }}>
          Admin Signup
        </Title>

        {role && (
          <Alert
            message={`You are signing up as: ${role.toUpperCase()}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "First name required" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Last name required" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[{ required: true, message: "Phone required" }]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Valid email required",
              },
            ]}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="Email" />
              <Button
                onClick={handleVerify}
                loading={verifyLoading}
                disabled={!canResend || codeSent}
                style={{ minWidth: 100 }}
              >
                {codeSent ? (canResend ? "Resend" : `${countdown}s`) : "Verify"}
              </Button>
            </Space.Compact>
          </Form.Item>

          {codeSent && (
            <Form.Item
              name="verificationCode"
              rules={[{ required: true, message: "Code required" }]}
            >
              <Input placeholder="6-digit Code" maxLength={6} />
            </Form.Item>
          )}

          <Form.Item
            name="inviteToken"
            rules={[{ required: true, message: "Invite token required" }]}
          >
            <Input placeholder="Invite Token" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, min: 6, message: "Min 6 characters" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Confirm password" }]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={signupLoading}
            block
          >
            Create Account
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
          Already have an account? <a href="/signin">Sign in</a>
        </Text>
      </Card>
    </div>
  );
}
