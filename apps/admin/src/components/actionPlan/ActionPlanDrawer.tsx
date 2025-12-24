import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Select,
  DatePicker,
  Progress,
  Tag,
  Typography,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { IActionPlan } from "@/hooks/useActionPlans";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface ActionStep {
  step: string;
  completed: boolean;
  responsibleParty: "teacher" | "parent" | "either";
}

interface ActionPlanDrawerProps {
  open: boolean;
  onClose: () => void;
  plan: IActionPlan | null;
  mode: "view" | "create" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
  students: { value: string; label: string }[];
  teachers: { value: string; label: string }[];
}

export const ActionPlanDrawer = ({
  open,
  onClose,
  plan,
  mode,
  form,
  onSubmit,
  loading = false,
  students,
  teachers,
}: ActionPlanDrawerProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const steps = Form.useWatch("actionSteps", form) || [];

  // Bulk set responsibleParty
  const setAllResponsible = (value: "teacher" | "parent" | "either") => {
    const updatedSteps = steps.map((step: ActionStep) => ({
      ...step,
      responsibleParty: value,
    }));
    form.setFieldsValue({ actionSteps: updatedSteps });
  };

  // Calculate progress
  const completedCount = steps.filter((s: ActionStep) => s.completed).length;
  const progress =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <Drawer
      title={
        <Space>
          {isView ? (
            <>
              <Title level={4} style={{ margin: 0 }}>
                Action Plan: {plan?.issue || "Details"}
              </Title>
            </>
          ) : isCreate ? (
            "Create New Action Plan"
          ) : (
            "Edit Action Plan"
          )}
        </Space>
      }
      width={720}
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        !isView && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {isCreate ? "Create" : "Update"}
            </Button>
          </Space>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isView}
        initialValues={{
          studentId: plan?.studentId._id,
          teacherId: plan?.teacherId._id,
          issue: plan?.issue,
          goal: plan?.goal,
          startDate: plan?.startDate ? dayjs(plan.startDate) : null,
          endDate: plan?.endDate ? dayjs(plan.endDate) : null,
          actionSteps: plan?.actionSteps.map((s) => ({
            step: s.step,
            completed: s.completed,
            responsibleParty: s.responsibleParty,
          })) || [{ step: "", completed: false, responsibleParty: "teacher" }],
        }}
      >
        {/* Student & Teacher */}
        <Space style={{ width: "100%" }} size="large">
          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true, message: "Please select a student" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select student"
              options={students}
              showSearch
              optionFilterProp="label"
              disabled={isView}
            />
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Teacher"
            rules={[{ required: true, message: "Please select a teacher" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select teacher"
              options={teachers}
              showSearch
              optionFilterProp="label"
              disabled={isView}
            />
          </Form.Item>
        </Space>

        {/* Issue & Goal */}
        <Form.Item
          name="issue"
          label="Issue / Concern"
          rules={[
            { required: true },
            { min: 5, message: "Minimum 5 characters" },
            { max: 500, message: "Maximum 500 characters" },
          ]}
        >
          <TextArea rows={3} placeholder="Describe the observed issue..." />
        </Form.Item>

        <Form.Item
          name="goal"
          label="Goal"
          rules={[
            { required: true },
            { min: 5, message: "Minimum 5 characters" },
            { max: 500, message: "Maximum 500 characters" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="What improvement are we aiming for?"
          />
        </Form.Item>

        {/* Dates */}
        <Space style={{ width: "100%" }} size="large">
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Divider>Action Steps</Divider>

        {/* Progress in view mode */}
        {isView && (
          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Text strong>Progress: {progress}%</Text>
            <Progress
              percent={progress}
              status={progress === 100 ? "success" : "active"}
            />
          </Space>
        )}

        {/* Bulk responsibility buttons (edit/create only) */}
        {!isView && steps.length > 0 && (
          <Space style={{ marginBottom: 16 }}>
            <Text strong>Set all steps to:</Text>
            <Button size="small" onClick={() => setAllResponsible("teacher")}>
              👩‍🏫 Teacher
            </Button>
            <Button size="small" onClick={() => setAllResponsible("parent")}>
              👨‍👩‍👧 Parent
            </Button>
            <Button size="small" onClick={() => setAllResponsible("either")}>
              Either
            </Button>
          </Space>
        )}

        <Form.List name="actionSteps">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 16 }}
                  align="start"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "step"]}
                    rules={[
                      { required: true, message: "Step required" },
                      { min: 5, message: "Min 5 chars" },
                      { max: 500, message: "Max 500 chars" },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <TextArea
                      placeholder="Describe the action step..."
                      autoSize={{ minRows: 2, maxRows: 8 }}
                      style={{ resize: "none" }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "responsibleParty"]}
                    initialValue="teacher"
                  >
                    <Select style={{ width: 140 }}>
                      <Select.Option value="teacher">
                        <Tag color="blue">👩‍🏫 Teacher</Tag>
                      </Select.Option>
                      <Select.Option value="parent">
                        <Tag color="green">👨‍👩‍👧 Parent</Tag>
                      </Select.Option>
                      <Select.Option value="either">
                        <Tag color="purple">Either</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  {!isView && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    />
                  )}
                </Space>
              ))}

              {!isView && (
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        step: "",
                        completed: false,
                        responsibleParty: "teacher",
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Step
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>

        {/* View mode step list */}
        {isView &&
          plan?.actionSteps.map((step, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text
                  style={{
                    display: "block",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {step.step}
                </Text>
                <Space>
                  <Tag
                    color={
                      step.responsibleParty === "teacher"
                        ? "blue"
                        : step.responsibleParty === "parent"
                        ? "green"
                        : "purple"
                    }
                  >
                    {step.responsibleParty === "teacher" && "👩‍🏫 Teacher"}
                    {step.responsibleParty === "parent" && "👨‍👩‍👧 Parent"}
                    {step.responsibleParty === "either" && "Either"}
                  </Tag>
                  {step.completed && <Tag color="success">Completed</Tag>}
                </Space>
              </Space>
            </div>
          ))}
      </Form>
    </Drawer>
  );
};
