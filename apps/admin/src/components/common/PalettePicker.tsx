import { Popover, Space, Typography, Radio } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { useTheme, PALETTES } from "@/context/ThemeContext";

const { Text } = Typography;

export const PalettePicker = () => {
  const { palette, setPalette } = useTheme();

  const content = (
    <div style={{ width: 260, padding: "8px 0" }}>
      <div style={{ padding: "0 16px 8px" }}>
        <Text strong>Choose Theme</Text>
      </div>
      {PALETTES.map((p) => (
        <div
          key={p.id}
          onClick={() => setPalette(p.id)}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderRadius: 6,
            backgroundColor:
              palette === p.id ? "rgba(0, 0, 0, 0.04)" : "transparent",
          }}
        >
          <Radio checked={palette === p.id} />
          <Space>
            <span style={{ fontSize: 14 }}>{p.name}</span>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: p.color,
                borderRadius: 4,
                border: "2px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
          </Space>
        </div>
      ))}
      <div
        style={{
          padding: "12px 16px 0",
          borderTop: "1px solid #f0f0f0",
          marginTop: 8,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Dark Mode (coming soon)
        </Text>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      arrow={false}
    >
      <BgColorsOutlined
        style={{
          fontSize: 21,
          cursor: "pointer",
          color: "var(--white)",
          padding: 8,
          borderRadius: 6,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      />
    </Popover>
  );
};
