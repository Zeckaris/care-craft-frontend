import { Typography, Space, Button, Avatar } from "antd";
import { EditOutlined, BankOutlined } from "@ant-design/icons";
import { type ISchoolInfo } from "@/hooks/useSchoolInfo";

const { Title, Text } = Typography;

interface SchoolInfoViewProps {
  data: ISchoolInfo;
  onEdit: () => void;
}

export const SchoolInfoView = ({ data, onEdit }: SchoolInfoViewProps) => {
  const { name, about, address, contactEmail, telephone, logo } = data;
  const telephoneNumbers = telephone ?? [];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Profile Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Avatar
          size={120}
          src={logo || undefined}
          icon={!logo && <BankOutlined />}
          style={{
            backgroundColor: logo ? "transparent" : "var(--primary)",
            border: "4px solid var(--white)",
            boxShadow: "var(--shadow-md)",
          }}
        />
        <Title
          level={2}
          style={{ margin: "16px 0 8px", color: "var(--text-dark)" }}
        >
          {name}
        </Title>
      </div>

      {/* About */}
      {about && (
        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            About
          </Text>
          <Text>{about}</Text>
        </div>
      )}

      {/* Contact Details */}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            Address
          </Text>
          <Text>{address}</Text>
        </div>

        <div>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            Email
          </Text>
          <Text type="secondary">{contactEmail}</Text>
        </div>

        <div>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            Telephone
          </Text>
          {telephoneNumbers.length > 0 ? (
            <Space direction="vertical" size={2}>
              {telephoneNumbers.map((number, index) => (
                <Text key={`${number}-${index}`} type="secondary">
                  {number}
                </Text>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Not set</Text>
          )}
        </div>
      </Space>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="large"
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};
