import { Button, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export const EmptyState = ({
  title,
  description,
  buttonText,
  onClick,
}: EmptyStateProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "40px 20px",
        color: "var(--text-dark)",
      }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <>
            <h3 style={{ margin: "16px 0 8px", fontWeight: 600 }}>{title}</h3>
            <p style={{ margin: 0, opacity: 0.7 }}>{description}</p>
          </>
        }
      />
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={onClick}
        style={{ marginTop: 24 }}
      >
        {buttonText}
      </Button>
    </div>
  );
};
