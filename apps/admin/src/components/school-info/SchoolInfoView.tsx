import { Card, Typography, Space, Button, Avatar } from "antd";
import { EditOutlined, DeleteOutlined, BankOutlined } from "@ant-design/icons";
import { type ISchoolInfo } from "@/hooks/useSchoolInfo";

const { Title, Text } = Typography;

interface SchoolInfoViewProps {
  data: ISchoolInfo;
  onEdit: () => void;
  onDelete: () => void;
}

export const SchoolInfoView = ({
  data,
  onEdit,
  onDelete,
}: SchoolInfoViewProps) => {
  const { name, address, contactEmail, contactPhone, logo } = data;

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
            Phone
          </Text>
          <Text type="secondary">{contactPhone}</Text>
        </div>
      </Space>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="large"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="large"
            onClick={onDelete}
          >
            Delete
          </Button>
        </Space>
      </div>
    </div>
  );
};
