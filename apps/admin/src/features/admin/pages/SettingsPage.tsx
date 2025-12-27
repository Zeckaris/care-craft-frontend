import { Typography, Divider, Space } from "antd";
import { BrandingSection } from "@/components/settings/BrandingSection";
// Placeholder imports will come later
// import { SecuritySection } from "@/components/settings/SecuritySection";
// import { AnnouncementsSection } from "@/components/settings/AnnouncementsSection";
// import { DataExportSection } from "@/components/settings/DataExportSection";
// import { DangerZoneSection } from "@/components/settings/DangerZoneSection";

const { Title, Paragraph } = Typography;

export const SettingsPage = () => {
  return (
    <div
      className="settings-page"
      style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Page Header */}
      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex", marginBottom: 32 }}
      >
        <Title level={1}>Settings</Title>
        <Paragraph type="secondary">
          Manage your school's branding, security, announcements, data exports,
          and other administrative controls.
        </Paragraph>
        <Divider />
      </Space>

      {/* Sections Stack */}
      <div className="settings-sections">
        {/* 1. Branding - Fully Implemented */}
        <BrandingSection />

        {/* 2. Security & Sessions - Placeholder */}
        {/* <SecuritySection /> */}

        {/* 3. Announcements - Placeholder */}
        {/* <AnnouncementsSection /> */}

        {/* 4. Data Export & Print - Placeholder */}
        {/* <DataExportSection /> */}

        {/* 5. Danger Zone - Placeholder */}
        {/* <DangerZoneSection /> */}
      </div>

      {/* Temporary visual placeholders for upcoming sections */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ color: "#8c8c8c", marginBottom: 24 }}>
          Coming Soon
        </Title>

        {[
          {
            title: "Security & Sessions",
            icon: "🔐",
            desc: "MFA, session management, and logout controls",
          },
          {
            title: "Announcements",
            icon: "📢",
            desc: "Send broadcast messages to user groups with history",
          },
          {
            title: "Data Export & Print",
            icon: "📊",
            desc: "Export reports in CSV/PDF with print-friendly styling",
          },
          {
            title: "Danger Zone",
            icon: "⚠️",
            desc: "Critical actions like resetting all data",
          },
        ].map((section) => (
          <div
            key={section.title}
            style={{
              padding: "24px",
              marginBottom: 16,
              background: "#fafafa",
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              opacity: 0.7,
            }}
          >
            <Space size="middle">
              <span style={{ fontSize: 32 }}>{section.icon}</span>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {section.title}
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {section.desc}
                </Paragraph>
              </div>
            </Space>
          </div>
        ))}
      </div>
    </div>
  );
};
