import {
  Card,
  Col,
  Row,
  Switch,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Modal,
  Input,
  Badge,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useSecurity } from "@/hooks/useSecurity";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";

const { Title, Text } = Typography;
const { confirm } = Modal;

export const SecuritySection = () => {
  const { toggleMfa, isSaving } = useSecurity();
  const { user, isLoading, refetch } = useCurrentUser();

  const [mfaLoading, setMfaLoading] = useState(false);

  const handleMfaToggle = async (checked: boolean) => {
    setMfaLoading(true);
    try {
      await toggleMfa(checked);
      message.success(
        `Multi-Factor Authentication ${
          checked ? "enabled" : "disabled"
        } successfully`
      );
      refetch(); // Refresh user data to reflect new MFA status
      if (checked) {
        message.info(
          "You will be required to verify with a code on your next login."
        );
      }
    } catch (err) {
      message.error("Failed to update MFA setting");
    } finally {
      setMfaLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 32 }}>
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      </Card>
    );
  }

  const isMfaEnabled = user?.mfaEnabled || false;

  return (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Security & Sessions</span>
        </Space>
      }
      style={{ marginBottom: 32 }}
    >
      <Row gutter={[0, 24]}>
        {/* MFA Section */}
        <Col span={24}>
          <Title level={5}>Multi-Factor Authentication (MFA)</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Add an extra layer of security by requiring a verification code sent
            to your email on every login.
          </Text>

          <Space align="center">
            <Switch
              checked={isMfaEnabled}
              onChange={handleMfaToggle}
              loading={mfaLoading || isSaving}
              disabled={isSaving}
            />
            <Text strong>
              {isMfaEnabled ? (
                <Badge status="success" text="Enabled" />
              ) : (
                <Badge status="default" text="Disabled" />
              )}
            </Text>
          </Space>

          {isMfaEnabled && (
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              A verification code will be sent to <strong>{user?.email}</strong>{" "}
              on login.
            </Text>
          )}
        </Col>

        {/* Placeholder for future Account Suspension (when ready) */}
        <Col span={24}>
          <Title level={5} style={{ color: "#8c8c8c", marginTop: 32 }}>
            Account Suspension Management
          </Title>
          <Text type="secondary">
            Manage access for teachers, coordinators, and parents by suspending
            accounts when needed.
          </Text>
          <div
            style={{
              padding: "32px",
              marginTop: 16,
              background: "#fafafa",
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            <UserOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <Title level={4} style={{ margin: "16px 0 8px", color: "#8c8c8c" }}>
              Coming Soon
            </Title>
            <Text type="secondary">
              List and suspend/unsuspend user accounts
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
