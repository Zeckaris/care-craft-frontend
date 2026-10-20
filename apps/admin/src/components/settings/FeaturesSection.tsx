import { useEffect, useState } from "react";
import { Card, Space, Spin, Switch, Typography, message } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";

const { Text } = Typography;

export const FeaturesSection = () => {
  const { schoolInfo, isLoading, updateFeatures, isSavingFeatures } =
    useSchoolInfo();
  const savedEnabled = schoolInfo?.features?.attributeEvaluation ?? false;
  const [optimisticEnabled, setOptimisticEnabled] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    setOptimisticEnabled(null);
  }, [savedEnabled]);

  const enabled = optimisticEnabled ?? savedEnabled;

  const handleToggle = async (checked: boolean) => {
    setOptimisticEnabled(checked);

    try {
      await updateFeatures({ attributeEvaluation: checked });
      message.success(
        `Student attribute evaluations ${checked ? "enabled" : "disabled"}.`,
      );
    } catch (err) {
      setOptimisticEnabled(null);
      const backendMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      message.error(
        backendMessage
          ? `Could not update feature: ${backendMessage}`
          : "Could not update feature. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 32 }}>
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      </Card>
    );
  }

  return (
    <Card
      id="features"
      title={
        <Space>
          <ExperimentOutlined />
          <span>Features</span>
        </Space>
      }
      style={{ marginBottom: 32 }}
    >
      <Space direction="vertical" size={8}>
        <Space size="middle">
          <Switch
            checked={enabled}
            loading={isSavingFeatures}
            onChange={handleToggle}
            aria-label="Enable student attribute evaluations"
          />
          <Text strong>Enable student attribute evaluations</Text>
        </Space>
        <Text type="secondary">
          Homeroom teachers will see student attribute evaluations on their home
          page only when enabled. Admins can turn this off at any time.
        </Text>
      </Space>
    </Card>
  );
};
