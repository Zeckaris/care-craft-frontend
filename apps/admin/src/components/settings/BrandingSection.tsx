import {
  Card,
  Col,
  Row,
  Select,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Input,
  Table,
  Avatar,
} from "antd";
import {
  FormatPainterOutlined,
  CheckCircleFilled,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  BookOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";
import { useState, useEffect } from "react";
import { PALETTES, useTheme } from "@/context/ThemeContext";

const { Title, Text } = Typography;
const { Search } = Input;

const FONT_OPTIONS = [
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Inter", label: "Inter" },
  { value: "Nunito", label: "Nunito" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Mountains of Christmas", label: "Mountains of Christmas" },
];

// Map palette id to CSS variables to use in live preview
const PALETTE_COLORS: Record<
  string,
  {
    headerBg: string;
    sidebarBg: string;
    contentBg: string;
    success: string;
    danger: string;
  }
> = {
  "palette-1": {
    headerBg: "#1f4d36",
    sidebarBg: "#2d6a4f",
    contentBg: "#f8faf9",
    success: "#22c55e",
    danger: "#ef4444",
  },
  "palette-2": {
    headerBg: "#047857",
    sidebarBg: "#059669",
    contentBg: "#f0fdf4",
    success: "#22c55e",
    danger: "#ef4444",
  },
  "palette-3": {
    headerBg: "#881337",
    sidebarBg: "#be123c",
    contentBg: "#fff1f2",
    success: "#10b981",
    danger: "#b91c1c",
  },
  "palette-4": {
    headerBg: "#0c4a6e",
    sidebarBg: "#164e63",
    contentBg: "#ecfeff",
    success: "#059669",
    danger: "#dc2626",
  },
  "palette-5": {
    headerBg: "#5b21b6",
    sidebarBg: "#6d28d9",
    contentBg: "#faf5ff",
    success: "#10b981",
    danger: "#c026d3",
  },
  "palette-6": {
    headerBg: "#0284c7",
    sidebarBg: "#0369a1",
    contentBg: "#f0f9ff",
    success: "#22c55e",
    danger: "#ef4444",
  },
  "palette-7": {
    headerBg: "#0c2340",
    sidebarBg: "#001233",
    contentBg: "#f0f7ff",
    success: "#059669",
    danger: "#dc2626",
  },
  "palette-8": {
    headerBg: "#861f2d",
    sidebarBg: "#991b1b",
    contentBg: "#fef2f2",
    success: "#16a34a",
    danger: "#b91c1c",
  },
  "palette-9": {
    headerBg: "#264e36",
    sidebarBg: "#1e3a2a",
    contentBg: "#f4f9f4",
    success: "#22c55e",
    danger: "#dc2626",
  },
  "palette-10": {
    headerBg: "#581c87",
    sidebarBg: "#4c1d95",
    contentBg: "#f4f1fb",
    success: "#059669",
    danger: "#e11d48",
  },
  "palette-11": {
    headerBg: "#9b2c2c",
    sidebarBg: "#7f1d1d",
    contentBg: "#f8f5f5",
    success: "#16a34a",
    danger: "#b91c1c",
  },
  "palette-12": {
    headerBg: "#3730a3",
    sidebarBg: "#4338ca",
    contentBg: "#eef2ff",
    success: "#059669",
    danger: "#dc2626",
  },
};

export const BrandingSection = () => {
  const { schoolInfo, isLoading, updateBranding, isSaving } = useSchoolInfo();
  const { fontFamily, setFontFamily } = useTheme(); // <-- Use theme context for font

  // Initialize state once based on schoolInfo
  const [selectedTheme, setSelectedTheme] = useState<string>(
    schoolInfo?.theme || "palette-1"
  );
  const [selectedFont, setSelectedFontState] = useState<string>(
    schoolInfo?.fontFamily || fontFamily || "Roboto"
  );

  // Only set state if schoolInfo was not loaded initially
  useEffect(() => {
    if (schoolInfo) {
      setSelectedTheme((prev) => prev || schoolInfo.theme || "palette-1");
      setSelectedFontState(
        (prev) => prev || schoolInfo.fontFamily || fontFamily || "Roboto"
      );
      setFontFamily(schoolInfo.fontFamily || fontFamily || "Roboto"); // <-- sync context on load
    }
  }, [schoolInfo, fontFamily, setFontFamily]);

  const hasChanges =
    selectedTheme !== (schoolInfo?.theme || "palette-1") ||
    selectedFont !== (schoolInfo?.fontFamily || "Roboto");

  const handleSave = async () => {
    try {
      await updateBranding({
        theme: selectedTheme,
        fontFamily: selectedFont,
      });
      message.success("Branding updated successfully!");
    } catch (err) {
      message.error("Failed to update branding");
    }
  };

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 32 }}>
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      </Card>
    );
  }

  const colors = PALETTE_COLORS[selectedTheme] || PALETTE_COLORS["palette-1"];

  return (
    <Card
      id="branding"
      title={
        <Space>
          <FormatPainterOutlined />
          <span>Branding</span>
        </Space>
      }
      style={{ marginBottom: 32 }}
      extra={
        hasChanges && (
          <Button
            type="primary"
            onClick={handleSave}
            loading={isSaving}
            style={{ background: "red", borderColor: "red" }}
          >
            Save Changes
          </Button>
        )
      }
    >
      <Row gutter={[24, 32]}>
        <Col span={24} md={12}>
          <Title level={5}>Live Preview</Title>
          <div
            style={{
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--border-color)",
              fontFamily: selectedFont,
              position: "relative",
              background: colors.contentBg,
              color: "#000",
            }}
          >
            {/* Mini Header */}
            <div
              style={{
                height: 50,
                background: colors.headerBg,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                color: "white",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Care Craft</span>
              <Space>
                <Search placeholder="Search..." style={{ width: 200 }} />
                <BellOutlined />
                <SettingOutlined />
                <Avatar icon={<UserOutlined />} />
              </Space>
            </div>

            {/* Sidebar and Content */}
            <div style={{ display: "flex" }}>
              {/* Sidebar */}
              <div
                style={{
                  width: 150,
                  background: colors.sidebarBg,
                  color: "white",
                  padding: "16px 8px",
                  fontSize: 12,
                }}
              >
                <Space direction="vertical" size="middle">
                  <Space>
                    <DashboardOutlined /> Dashboard
                  </Space>
                  <Space>
                    <UserOutlined /> Students
                  </Space>
                  <Space>
                    <BookOutlined /> Subjects
                  </Space>
                </Space>
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  padding: 16,
                  background: colors.contentBg,
                }}
              >
                <Title level={4} style={{ marginBottom: 8 }}>
                  Subjects Management
                </Title>
                <Search
                  placeholder="Search subjects..."
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={[
                    { title: "Subject Name", dataIndex: "name" },
                    { title: "Description", dataIndex: "desc" },
                    { title: "Created", dataIndex: "created" },
                    { title: "Actions", dataIndex: "actions" },
                  ]}
                  dataSource={[
                    {
                      key: "1",
                      name: "PE",
                      desc: "Physical education for all",
                      created: "Nov 13, 2025",
                      actions: (
                        <Space>
                          <EyeOutlined style={{ color: colors.success }} />
                          <DeleteOutlined style={{ color: colors.danger }} />
                        </Space>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            </div>
          </div>
        </Col>

        {/* Palette Selection */}
        <Col span={24}>
          <Title level={5}>Color Theme</Title>
          <Text type="secondary">
            Choose a predefined color palette for your school
          </Text>

          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            {PALETTES.map((pal) => (
              <Col key={pal.id} xs={24} sm={12} md={8} lg={6}>
                <div
                  className={`palette-preview ${pal.id}`}
                  onClick={() => setSelectedTheme(pal.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    border:
                      selectedTheme === pal.id
                        ? "3px solid var(--palette-primary)"
                        : "2px solid transparent",
                    transform:
                      selectedTheme === pal.id
                        ? "translateY(-8px)"
                        : "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTheme !== pal.id) {
                      e.currentTarget.style.boxShadow =
                        "0 12px 28px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTheme !== pal.id) {
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.08)";
                    }
                  }}
                >
                  <div
                    style={{
                      height: 120,
                      background: "var(--palette-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: 700,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {pal.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", height: 60 }}>
                    <div
                      style={{ flex: 1, background: "var(--palette-accent)" }}
                    />
                    <div
                      style={{ flex: 1, background: "var(--palette-success)" }}
                    />
                    <div
                      style={{ flex: 1, background: "var(--palette-sidebar)" }}
                    />
                    <div
                      style={{
                        flex: 1,
                        background:
                          "var(--palette-card-bg, var(--palette-content-bg))",
                      }}
                    />
                  </div>

                  {selectedTheme === pal.id && (
                    <CheckCircleFilled
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 32,
                        color: "#52c41a",
                      }}
                    />
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Font Family */}
        <Col span={24} md={12}>
          <Title level={5}>Font Family</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Select the primary font used throughout the application
          </Text>
          <Select
            value={selectedFont}
            onChange={(val) => {
              setSelectedFontState(val); // local preview
              setFontFamily(val); // update context & live app
            }}
            style={{ width: "100%" }}
            size="large"
            options={FONT_OPTIONS}
            placeholder="Choose a font"
          />
        </Col>
      </Row>
    </Card>
  );
};
