import {
  Card,
  Col,
  Row,
  Switch,
  message,
  Spin,
  Typography,
  Space,
  Modal,
  Badge,
  AutoComplete,
  Button,
  Input,
} from "antd";
import { LockOutlined, UserAddOutlined } from "@ant-design/icons";
import { useSecurity } from "@/hooks/useSecurity";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserSearch, type SearchUser } from "@/hooks/useUserSearch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export const SecuritySection = () => {
  const { toggleMfa, isSaving, suspendUser, unsuspendUser } = useSecurity();
  const { user, isLoading, refetch } = useCurrentUser();

  const [mfaLoading, setMfaLoading] = useState(false);

  const [suspendSearch, setSuspendSearch] = useState("");
  const [unsuspendSearch, setUnsuspendSearch] = useState("");

  const [selectedForSuspend, setSelectedForSuspend] =
    useState<SearchUser | null>(null);
  const [selectedForUnsuspend, setSelectedForUnsuspend] =
    useState<SearchUser | null>(null);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending] = useState(false);

  const navigate = useNavigate();

  const { users: activeUsers, loading: activeLoading } = useUserSearch(
    suspendSearch,
    { suspendedOnly: false },
  );

  const { users: suspendedUsers, loading: suspendedLoading } = useUserSearch(
    unsuspendSearch,
    { suspendedOnly: true },
  );

  const handleMfaToggle = async (checked: boolean) => {
    setMfaLoading(true);
    try {
      await toggleMfa(checked);
      message.success(
        `Multi-Factor Authentication ${
          checked ? "enabled" : "disabled"
        } successfully`,
      );
      refetch();
    } catch {
      message.error("Failed to update MFA setting");
    } finally {
      setMfaLoading(false);
    }
  };

  const openSuspendModal = (user: SearchUser) => {
    setSelectedForSuspend(user);
    setSuspendReason("");
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedForSuspend) return;

    try {
      setSuspending(true);
      await suspendUser(selectedForSuspend.id, suspendReason.trim());
      message.success(`${selectedForSuspend.fullName} has been suspended.`);
      setSuspendModalOpen(false);
      setSelectedForSuspend(null);
      setSuspendSearch("");
    } catch {
      message.error("Failed to suspend account.");
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedForUnsuspend) return;

    try {
      await unsuspendUser(selectedForUnsuspend.id);
      message.success(`${selectedForUnsuspend.fullName} has been restored.`);
      setSelectedForUnsuspend(null);
      setUnsuspendSearch("");
    } catch {
      message.error("Failed to restore account.");
    }
  };

  const renderOption = (user: SearchUser) => ({
    value: user.id,
    label: (
      <Space>
        <Text strong>{user.fullName}</Text>
        <Text type="secondary">({user.role})</Text>
        <Badge
          status={user.isSuspended ? "error" : "success"}
          text={user.isSuspended ? "Suspended" : "Active"}
        />
      </Space>
    ),
  });

  if (isLoading) {
    return (
      <Card>
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      </Card>
    );
  }

  const isMfaEnabled = user?.mfaEnabled || false;

  return (
    <>
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
          {/* ================= MFA ================= */}
          <Col span={24}>
            <Title level={5}>Multi-Factor Authentication</Title>
            <Space>
              <Switch
                checked={isMfaEnabled}
                onChange={handleMfaToggle}
                loading={mfaLoading || isSaving}
              />
              <Badge
                status={isMfaEnabled ? "success" : "default"}
                text={isMfaEnabled ? "Enabled" : "Disabled"}
              />
            </Space>
          </Col>

          {/* ================= SUSPENSION ================= */}
          <Col span={24}>
            <Title level={5} style={{ marginTop: 32 }}>
              Account Suspension Management
            </Title>

            {/* -------- Suspend -------- */}
            <Text strong style={{ display: "block" }}>
              Suspend an account
            </Text>
            <AutoComplete
              style={{ maxWidth: 560, width: "100%", marginTop: 8 }}
              options={activeUsers.map(renderOption)}
              value={suspendSearch}
              onSearch={setSuspendSearch}
              onSelect={(id) => {
                const selected = activeUsers.find((u) => u.id === id);
                if (selected) {
                  setSuspendSearch(selected.fullName);
                  openSuspendModal(selected);
                }
              }}
              onClear={() => {
                setSuspendSearch("");
                setSelectedForSuspend(null);
              }}
              allowClear
              placeholder="Search active users..."
              notFoundContent={
                activeLoading ? <Spin size="small" /> : "No active users"
              }
            />

            {/* -------- Unsuspend -------- */}
            <Text strong style={{ marginTop: 24, display: "block" }}>
              Restore (unsuspend) an account
            </Text>
            <AutoComplete
              style={{ maxWidth: 560, width: "100%", marginTop: 8 }}
              options={suspendedUsers.map(renderOption)}
              value={unsuspendSearch}
              onSearch={setUnsuspendSearch}
              onSelect={(id) => {
                const selected = suspendedUsers.find((u) => u.id === id);
                if (selected) {
                  setSelectedForUnsuspend(selected);
                  setUnsuspendSearch(selected.fullName);
                }
              }}
              onClear={() => {
                setUnsuspendSearch("");
                setSelectedForUnsuspend(null);
              }}
              allowClear
              placeholder="Search suspended users..."
              notFoundContent={
                suspendedLoading ? <Spin size="small" /> : "No suspended users"
              }
            />

            {selectedForUnsuspend && (
              <Space
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f6ffed",
                  borderRadius: 6,
                }}
              >
                <Text type="secondary">
                  Selected: <strong>{selectedForUnsuspend.fullName}</strong> (
                  {selectedForUnsuspend.role})
                </Text>
                <Space>
                  <Button type="primary" onClick={handleUnsuspend}>
                    Restore Access
                  </Button>
                  <Button onClick={() => setSelectedForUnsuspend(null)}>
                    Cancel
                  </Button>
                </Space>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* ================= SUSPEND MODAL ================= */}
      <Modal
        open={suspendModalOpen}
        title={`Suspend ${selectedForSuspend?.fullName}`}
        okText="Suspend Account"
        okButtonProps={{ danger: true, loading: suspending }}
        onCancel={() => setSuspendModalOpen(false)}
        onOk={handleConfirmSuspend}
      >
        <Text type="secondary">
          Optionally provide a reason for suspending this account.
        </Text>
        <Input.TextArea
          rows={4}
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Reason (optional)"
          style={{ marginTop: 12 }}
        />
      </Modal>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => navigate("/invite")}
        >
          Send Invite to New Admin
        </Button>
      </div>
    </>
  );
};
