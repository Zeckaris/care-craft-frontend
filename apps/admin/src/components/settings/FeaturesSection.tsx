import { useEffect, useState } from "react";
import { Card, Space, Spin, Switch, Typography, message } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";

const { Text } = Typography;

type FeatureKey = "attributeEvaluation" | "observations";

export const FeaturesSection = () => {
  const { schoolInfo, isLoading, updateFeatures, isSavingFeatures } =
    useSchoolInfo();

  const savedEnabled: Record<FeatureKey, boolean> = {
    attributeEvaluation: schoolInfo?.features?.attributeEvaluation ?? false,
    observations: schoolInfo?.features?.observations ?? false,
  };

  const [optimistic, setOptimistic] = useState<
    Partial<Record<FeatureKey, boolean>>
  >({});

  useEffect(() => {
    setOptimistic({});
  }, [savedEnabled.attributeEvaluation, savedEnabled.observations]);

  const isEnabled = (key: FeatureKey) =>
    optimistic[key] ?? savedEnabled[key];

  const handleToggle = async (
    key: FeatureKey,
    label: string,
    checked: boolean,
  ) => {
    setOptimistic((current) => ({ ...current, [key]: checked }));

    try {
      await updateFeatures({ [key]: checked });
      message.success(`${label} ${checked ? "enabled" : "disabled"}.`);
    } catch (err) {
      setOptimistic((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
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
      <Space direction="vertical" size={16}>
        <Space direction="vertical" size={8}>
          <Space size="middle">
            <Switch
              checked={isEnabled("attributeEvaluation")}
              loading={isSavingFeatures}
              onChange={(checked) =>
                handleToggle(
                  "attributeEvaluation",
                  "Student attribute evaluations",
                  checked,
                )
              }
              aria-label="Enable student attribute evaluations"
            />
            <Text strong>Enable student attribute evaluations</Text>
          </Space>
          <Text type="secondary">
            Homeroom teachers will see student attribute evaluations on their
            home page only when enabled. Admins can turn this off at any time.
          </Text>
        </Space>

        <Space direction="vertical" size={8}>
          <Space size="middle">
            <Switch
              checked={isEnabled("observations")}
              loading={isSavingFeatures}
              onChange={(checked) =>
                handleToggle("observations", "Student observations", checked)
              }
              aria-label="Enable student observations"
            />
            <Text strong>Enable student observations</Text>
          </Space>
          <Text type="secondary">
            Teachers will see student observations in the teacher app only when
            enabled. Admins can turn this off at any time.
          </Text>
        </Space>
      </Space>
    </Card>
  );
};
