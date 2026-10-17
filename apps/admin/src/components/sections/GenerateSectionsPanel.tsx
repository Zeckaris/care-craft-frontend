import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { FormInstance } from "antd";
import { ThunderboltOutlined, EyeOutlined } from "@ant-design/icons";
import { useSectionGeneration } from "@/hooks/useSectionGeneration";
import { useGrades } from "@/hooks/useGrades";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import type {
  ISectionGenerationInput,
  ISectionGenerationResult,
} from "@carecraft/types";
import {
  type GenerationInfo,
  getErrorMessage,
  getErrorStatus,
  isFormValidationError,
} from "./studentAssignmentUtils";

const { Text } = Typography;

interface GenerateSectionsPanelProps {
  /** Called after a real (non-dry) run so the page can remember the max size. */
  onGenerated?: (info: GenerationInfo) => void;
}

interface PreviewState {
  request: ISectionGenerationInput;
  result: ISectionGenerationResult;
}

const positiveIntegerRule = {
  validator: (_: unknown, value: number | null | undefined) => {
    if (value === undefined || value === null || (value as unknown) === "")
      return Promise.reject(new Error("This field is required"));
    if (!Number.isInteger(value) || (value as number) <= 0)
      return Promise.reject(new Error("Must be a positive whole number"));
    return Promise.resolve();
  },
};

const crossSizeRule = (form: FormInstance) => ({
  validator: () => {
    const min = form.getFieldValue("minSize");
    const target = form.getFieldValue("targetSize");
    const max = form.getFieldValue("maxSize");
    if ([min, target, max].some((v) => typeof v !== "number"))
      return Promise.resolve();
    if (min <= target && target <= max) return Promise.resolve();
    return Promise.reject(new Error("Must satisfy min ≤ target ≤ max"));
  },
});

export function GenerateSectionsPanel({
  onGenerated,
}: GenerateSectionsPanelProps) {
  const [form] = Form.useForm();

  const { grades } = useGrades();
  const { currentCalendar } = useAcademicCalendars();
  const { generate, isGenerating } = useSectionGeneration();

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Default the school year to the current academic calendar (editable).
  useEffect(() => {
    if (currentCalendar && !form.getFieldValue("schoolYear")) {
      form.setFieldValue("schoolYear", currentCalendar.academicYear);
    }
  }, [currentCalendar, form]);

  const invalidatePreview = () => {
    setPreview(null);
    setConflictMessage(null);
  };

  const buildInput = (values: ISectionGenerationInput): ISectionGenerationInput => ({
    gradeId: values.gradeId,
    schoolYear: values.schoolYear.trim(),
    targetSize: values.targetSize,
    minSize: values.minSize,
    maxSize: values.maxSize,
  });

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setIsPreviewing(true);
      setConflictMessage(null);
      const result = await generate(buildInput(values), true);
      setPreview({ request: buildInput(values), result });
    } catch (err) {
      if (isFormValidationError(err)) return; // client-side validation
      setPreview(null);
      const status = getErrorStatus(err);
      if (status === 409) {
        setConflictMessage(getErrorMessage(err));
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setIsPreviewing(false);
    }
  };

  const runGeneration = async () => {
    if (!preview) return;
    try {
      const result = await generate(preview.request, false);
      message.success(
        `Generated ${result.sectionCount} section(s) for ${result.totalStudents} student(s)`
      );
      onGenerated?.({
        gradeId: preview.request.gradeId,
        schoolYear: preview.request.schoolYear,
        maxSize: preview.request.maxSize,
      });
      invalidatePreview();
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 409) {
        setConflictMessage(getErrorMessage(err));
      } else {
        message.error(getErrorMessage(err));
      }
    }
  };

  const handleGenerate = () => {
    if (!preview) return;
    Modal.confirm({
      title: "Generate sections now?",
      content:
        "This assigns all currently unassigned students of this grade and year to the planned sections and creates any missing sections. It cannot be undone in one step.",
      okText: "Generate",
      cancelText: "Cancel",
      onOk: runGeneration,
    });
  };

  const gradeOptions = grades.map((g) => ({ label: g.level, value: g._id }));

  const canGenerate = !!preview && !isGenerating;

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined style={{ color: "#1677ff" }} />
          <span>Auto-Generate Sections</span>
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Text type="secondary">
        Assign every unassigned student of one grade and school year to
        alphabet-named sections. Preview first — nothing is written until you
        generate.
      </Text>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        onValuesChange={invalidatePreview}
      >
        <Space wrap align="start" size="middle">
          <Form.Item
            name="gradeId"
            label="Grade"
            rules={[{ required: true, message: "Please select a grade" }]}
            style={{ minWidth: 200 }}
          >
            <Select
              placeholder="Select grade"
              options={gradeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="schoolYear"
            label="School Year"
            rules={[
              { required: true, message: "Please enter a school year" },
              {
                pattern: /^\d{4}-\d{4}$/,
                message: "Use the YYYY-YYYY format (e.g. 2024-2025)",
              },
            ]}
          >
            <Input placeholder="e.g. 2024-2025" style={{ width: 180 }} />
          </Form.Item>

          <Form.Item
            name="targetSize"
            label="Target size"
            dependencies={["minSize", "maxSize"]}
            rules={[positiveIntegerRule, crossSizeRule(form)]}
          >
            <InputNumber min={1} precision={0} style={{ width: 130 }} />
          </Form.Item>

          <Form.Item
            name="minSize"
            label="Min size"
            dependencies={["targetSize", "maxSize"]}
            rules={[positiveIntegerRule, crossSizeRule(form)]}
          >
            <InputNumber min={1} precision={0} style={{ width: 130 }} />
          </Form.Item>

          <Form.Item
            name="maxSize"
            label="Max size"
            dependencies={["minSize", "targetSize"]}
            rules={[positiveIntegerRule, crossSizeRule(form)]}
          >
            <InputNumber min={1} precision={0} style={{ width: 130 }} />
          </Form.Item>
        </Space>
      </Form>

      <Space wrap>
        <Button
          icon={<EyeOutlined />}
          onClick={handlePreview}
          loading={isPreviewing}
          disabled={isGenerating}
        >
          Preview (dry run)
        </Button>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={!canGenerate}
        >
          Generate Sections
        </Button>
      </Space>

      {conflictMessage && (
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
          message="Existing sections already hold students for this grade and year"
          description={
            <span>
              {conflictMessage}
              <br />
              Move or clear those students first (use the Students button on the
              sections list), or pick a different grade/year, then preview again.
            </span>
          }
        />
      )}

      {preview && (
        <div style={{ marginTop: 24 }}>
          {preview.result.totalStudents === 0 ? (
            <Alert
              type="info"
              showIcon
              message="No unassigned students"
              description={`There are no unassigned, active students for this grade and school year (${preview.result.schoolYear}). Nothing to generate.`}
            />
          ) : (
            <>
              <Space size="large" wrap style={{ marginBottom: 12 }}>
                <Statistic
                  title="Unassigned students"
                  value={preview.result.totalStudents}
                />
                <Statistic
                  title="Planned sections"
                  value={preview.result.sectionCount}
                />
                <Statistic
                  title="New sections"
                  value={
                    preview.result.sections.filter((s) => s.isNew).length
                  }
                />
                <Statistic
                  title="Reused sections"
                  value={
                    preview.result.sections.filter((s) => !s.isNew).length
                  }
                />
              </Space>

              {preview.result.warning && (
                <Alert
                  type="warning"
                  showIcon
                  message={preview.result.warning}
                  style={{ marginBottom: 12 }}
                />
              )}

              <Table
                size="small"
                rowKey={(record) => `${record.name}-${record.sectionId ?? "new"}`}
                pagination={false}
                dataSource={preview.result.sections}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No sections in this plan"
                    />
                  ),
                }}
                columns={[
                  {
                    title: "Section",
                    dataIndex: "name",
                    render: (name: string) => <Text strong>{name}</Text>,
                  },
                  {
                    title: "Students",
                    dataIndex: "size",
                  },
                  {
                    title: "Status",
                    dataIndex: "isNew",
                    render: (isNew: boolean) => (
                      <Tag color={isNew ? "green" : "blue"}>
                        {isNew ? "New" : "Reused"}
                      </Tag>
                    ),
                  },
                ]}
              />
            </>
          )}
        </div>
      )}
    </Card>
  );
}
