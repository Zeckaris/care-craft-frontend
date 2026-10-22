import { useEffect } from "react";
import {
  Drawer,
  Form,
  Select,
  Button,
  Space,
  Alert,
  Typography,
  Spin,
} from "antd";
import { CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import type { ITeachingAssignment, TeachingRole } from "@carecraft/types";
import { useTeacherPicker } from "@/hooks/useTeacherPicker";
import { useGradeSubjects } from "@/hooks/useGradeSubjects";

const { Text } = Typography;

export type AssignmentDrawerMode =
  | "create-homeroom"
  | "create-subject"
  | "reassign";

interface TeachingAssignmentDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: AssignmentDrawerMode;
  /** For "reassign" mode — the assignment being updated */
  assignment?: ITeachingAssignment | null;
  /** The grade's level string (e.g. "Grade 5") — used to fetch available subjects */
  gradeLevel?: string;
  /** Called with validated form values */
  onSubmit: (values: {
    teacherId: string;
    role?: TeachingRole;
    subjectId?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function TeachingAssignmentDrawer({
  open,
  onClose,
  mode,
  assignment,
  gradeLevel,
  onSubmit,
  loading = false,
}: TeachingAssignmentDrawerProps) {
  const [form] = Form.useForm();

  const { teachers, isLoading: teachersLoading } = useTeacherPicker();
  const { gsas, isLoading: subjectsLoading, isError: subjectsError } =
    useGradeSubjects(mode === "create-subject" ? gradeLevel : undefined);

  // Pre-fill teacher when reassigning
  useEffect(() => {
    if (open && mode === "reassign" && assignment) {
      form.setFieldValue("teacherId", assignment.teacherId._id);
    } else if (open) {
      form.resetFields();
    }
  }, [open, mode, assignment, form]);

  const title =
    mode === "create-homeroom"
      ? "Assign Homeroom Teacher"
      : mode === "create-subject"
      ? "Assign Subject Teacher"
      : `Reassign Teacher — ${
          assignment?.role === "homeroom"
            ? "Homeroom"
            : assignment?.subjectId?.name ?? "Subject"
        }`;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch {
      // validation errors are shown inline
    }
  };

  const noSubjects =
    mode === "create-subject" && !subjectsLoading && gsas.length === 0;

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
          <span>{title}</span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        <div style={{ textAlign: "right", padding: "8px 0" }}>
          <Space>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleOk}
              loading={loading}
              disabled={noSubjects}
            >
              {mode === "reassign" ? "Reassign" : "Assign"}
            </Button>
          </Space>
        </div>
      }
    >
      {/* No subjects warning */}
      {mode === "create-subject" && subjectsLoading && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Spin tip="Loading subjects for this grade..." />
        </div>
      )}

      {mode === "create-subject" && subjectsError && (
        <Alert
          type="error"
          message="Could not load subjects for this grade."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {noSubjects && (
        <Alert
          type="warning"
          showIcon
          message="No subjects linked to this grade"
          description={
            <span>
              Before assigning a subject teacher, at least one subject must be
              linked to this grade via the{" "}
              <Link to="/app/gsa">
                <LinkOutlined /> Grade–Subject–Assessment Setup
              </Link>{" "}
              page.
            </span>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Reassign info */}
      {mode === "reassign" && assignment && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Current teacher:{" "}
            <Text strong>
              {assignment.teacherId.firstName} {assignment.teacherId.lastName}
            </Text>
          </Text>
          {assignment.subjectId && (
            <div>
              <Text type="secondary">
                Subject: <Text strong>{assignment.subjectId.name}</Text>
              </Text>
            </div>
          )}
        </div>
      )}

      <Form form={form} layout="vertical">
        {/* Subject picker — only for create-subject */}
        {mode === "create-subject" && !subjectsLoading && gsas.length > 0 && (
          <Form.Item
            name="subjectId"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select subject"
              showSearch
              optionFilterProp="children"
              disabled={loading}
            >
              {gsas.map((gsa) => (
                <Select.Option
                  key={gsa.subjectId._id}
                  value={gsa.subjectId._id}
                >
                  {gsa.subjectId.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Teacher picker */}
        <Form.Item
          name="teacherId"
          label="Teacher"
          rules={[{ required: true, message: "Please select a teacher" }]}
        >
          <Select
            placeholder="Select teacher"
            loading={teachersLoading}
            showSearch
            optionFilterProp="children"
            disabled={loading}
          >
            {teachers.map((t) => (
              <Select.Option key={t._id} value={t._id}>
                {t.firstName} {t.lastName}{" "}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({t.email})
                </Text>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
