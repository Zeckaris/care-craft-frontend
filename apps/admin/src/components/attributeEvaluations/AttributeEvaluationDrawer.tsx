import { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  Button,
  Spin,
  Descriptions,
} from "antd";
import { CloseOutlined, WarningOutlined } from "@ant-design/icons";
import { type IAttributeEvaluation } from "@/hooks/useAttributeEvaluations";
import { useAttributeCategories } from "@/hooks/useAttributeCategories";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface AttributeEvaluationDrawerProps {
  open: boolean;
  onClose: () => void;
  evaluation: IAttributeEvaluation | null;
  mode: "view" | "edit" | "create";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export function AttributeEvaluationDrawer({
  open,
  onClose,
  evaluation,
  mode,
  form,
  onSubmit,
  loading = false,
}: AttributeEvaluationDrawerProps) {
  const isView = mode === "view";
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);

  const { categories, isLoading: categoriesLoading } = useAttributeCategories({
    pagination: { page: 1, pageSize: 100 },
  });

  useEffect(() => {
    if (!open) {
      setShowOverrideWarning(false);
      return;
    }

    if (evaluation && mode !== "create") {
      const attrs = evaluation.attributes.reduce((acc: any, item: any) => {
        acc[`score_${item.attributeId._id}`] = item.score;
        acc[`comment_${item.attributeId._id}`] = item.comment || "";
        return acc;
      }, {});

      form.setFieldsValue({
        studentId: evaluation.studentId?._id,
        studentEnrollmentId: evaluation.studentEnrollmentId?._id,
        teacherId: evaluation.teacherId._id,
        remark: evaluation.remark || "",
        ...attrs,
      });
    } else {
      form.resetFields();
    }

    if (mode !== "view") {
      setShowOverrideWarning(true);
    }
  }, [open, evaluation, mode]); // FIXED — removed `form` from deps to stop infinite loop

  const handleContinue = () => {
    setShowOverrideWarning(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {isView
              ? "Evaluation Details"
              : mode === "create"
              ? "Create Evaluation (Admin Override)"
              : "Edit Evaluation (Admin Override)"}
          </span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        !isView &&
        !showOverrideWarning && (
          <div style={{ textAlign: "right", padding: "8px 0" }}>
            <Space>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" onClick={onSubmit} loading={loading}>
                {mode === "create" ? "Create Evaluation" : "Save Changes"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {showOverrideWarning && (
        <div style={{ padding: "24px 0" }}>
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined style={{ fontSize: 24 }} />}
            message={
              <div>
                <Title level={4}>Admin Override Required</Title>
                <Text>
                  You are {mode === "create" ? "creating" : "editing"} an
                  attribute evaluation as an administrator.
                  <br />
                  This action should{" "}
                  <strong>normally be performed by the teacher</strong>.
                  <br />
                  Only proceed if this is an emergency correction or missing
                  data fix.
                </Text>
              </div>
            }
            action={
              <Space direction="vertical" style={{ marginTop: 16 }}>
                <Button
                  size="large"
                  onClick={() => setShowOverrideWarning(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="large"
                  type="primary"
                  danger
                  onClick={handleContinue}
                >
                  Yes, I understand — Continue
                </Button>
              </Space>
            }
          />
        </div>
      )}

      {isView && evaluation && (
        <>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Student" span={2}>
              <Text strong>
                {evaluation.studentId?.firstName}{" "}
                {evaluation.studentId?.lastName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Grade">
              {evaluation.studentEnrollmentId?.gradeId.level || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="School Year">
              {evaluation.studentEnrollmentId?.schoolYear || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Teacher" span={2}>
              {evaluation.teacherId.firstName} {evaluation.teacherId.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Evaluation Date">
              {formatDate(evaluation.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Score">
              <Tag color="blue" style={{ fontSize: 16, padding: "4px 12px" }}>
                <strong>{evaluation.totalScore}</strong>
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider>Attribute Scores</Divider>

          {evaluation.attributes.map((item) => (
            <div key={item.attributeId._id} style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>{item.attributeId.name}</Text>
                  {item.attributeId.description && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({item.attributeId.description})
                    </Text>
                  )}
                </div>
                <Space>
                  <Tag color="green">
                    Score: {item.score} / {item.attributeId.maxScore}
                  </Tag>
                  {item.comment && (
                    <Text type="secondary">“{item.comment}”</Text>
                  )}
                </Space>
              </Space>
            </div>
          ))}

          {evaluation.remark && (
            <>
              <Divider>Final Remark</Divider>
              <Text italic>{evaluation.remark}</Text>
            </>
          )}
        </>
      )}

      {!isView && !showOverrideWarning && (
        <Form
          form={form}
          layout="vertical"
          disabled={loading || categoriesLoading}
        >
          {categoriesLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat._id} style={{ marginBottom: 24 }}>
                <Title level={5}>{cat.name}</Title>
                {cat.description && (
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 12 }}
                  >
                    {cat.description}
                  </Text>
                )}

                <Space align="baseline">
                  <Form.Item
                    name={["score", cat._id]}
                    label="Score"
                    rules={[
                      { required: true, message: "Score is required" },
                      {
                        type: "number",
                        min: cat.minScore,
                        max: cat.maxScore,
                        message: `Score must be between ${cat.minScore} and ${cat.maxScore}`,
                      },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <InputNumber
                      min={cat.minScore}
                      max={cat.maxScore}
                      style={{ width: 120 }}
                    />
                  </Form.Item>

                  <Text>
                    ({cat.minScore} – {cat.maxScore})
                  </Text>
                </Space>

                <Form.Item
                  name={["comment", cat._id]}
                  label="Comment (optional)"
                >
                  <TextArea rows={2} placeholder="Add a comment..." />
                </Form.Item>
              </div>
            ))
          )}

          <Form.Item name="remark" label="Final Remark (optional)">
            <TextArea rows={4} placeholder="Overall feedback or notes..." />
          </Form.Item>

          <Form.Item name="studentId" hidden />
          <Form.Item name="studentEnrollmentId" hidden />
          <Form.Item name="teacherId" hidden />
        </Form>
      )}
    </Drawer>
  );
}
