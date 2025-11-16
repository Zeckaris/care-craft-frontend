import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  Avatar,
  Typography,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGrades } from "@/hooks/useGrades";
import { useStudents } from "@/hooks/useStudents";
import { useEffect } from "react";

const { Text } = Typography;
const { Option } = Select;

interface IEnrollment {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    profileImage?: string;
  };
  gradeId: {
    _id: string;
    level: string;
  };
  schoolYear: string;
  isActive: boolean;
  createdAt?: string;
}

interface EnrollmentDrawerProps {
  open: boolean;
  onClose: () => void;
  enrollment: IEnrollment | null;
  mode: "view" | "edit";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export const EnrollmentDrawer = ({
  open,
  onClose,
  enrollment,
  mode,
  form,
  onSubmit,
  loading,
}: EnrollmentDrawerProps) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = !enrollment && isEdit;

  const { students } = useStudents({ pagination: { page: 1, pageSize: 1000 } });
  const { grades } = useGrades();

  const student = enrollment?.studentId;
  const profileUrl = student?.profileImage || null;

  useEffect(() => {
    if (enrollment) {
      form.setFieldsValue({
        studentId: enrollment.studentId._id,
        gradeId: enrollment.gradeId._id,
        schoolYear: enrollment.schoolYear,
      });
    } else {
      form.resetFields();
    }
  }, [enrollment, form]);

  return (
    <Drawer
      title={
        <Space>
          {isView && (
            <Avatar size={48} icon={<UserOutlined />} src={profileUrl} />
          )}
          {isView
            ? `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
              "Enrollment Details"
            : enrollment
            ? "Edit Enrollment"
            : "New Enrollment"}
        </Space>
      }
      width={640}
      onClose={onClose}
      open={open}
      extra={
        isEdit && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {enrollment ? "Update" : "Create"}
            </Button>
          </Space>
        )
      }
    >
      <Form form={form} layout="vertical" disabled={isView}>
        {/* Student Select (only in create) */}
        {isCreate && (
          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true, message: "Select a student" }]}
          >
            <Select
              showSearch
              placeholder="Search student..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                ((option?.label as string) ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {students.map((s) => (
                <Option
                  key={s._id}
                  value={s._id}
                  label={`${s.firstName} ${s.lastName}`}
                >
                  <Space>
                    <Avatar
                      size="small"
                      src={s.profileImage}
                      icon={<UserOutlined />}
                    />
                    <span>
                      {s.firstName} {s.middleName} {s.lastName}
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Student Name (read-only in view/edit) */}
        {!isCreate && (
          <Form.Item label="Student">
            <Input
              value={
                student
                  ? `${student.firstName} ${student.middleName || ""} ${
                      student.lastName
                    }`
                  : "—"
              }
              disabled
              prefix={<UserOutlined />}
            />
          </Form.Item>
        )}

        {/* Grade */}
        <Form.Item
          name="gradeId"
          label="Grade"
          rules={[{ required: true, message: "Select grade" }]}
        >
          <Select placeholder="Select grade" disabled={isView}>
            {grades.map((grade) => (
              <Option key={grade._id} value={grade._id}>
                {grade.level}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* School Year */}
        <Form.Item
          name="schoolYear"
          label="School Year"
          rules={[{ required: true, message: "Enter school year" }]}
        >
          <Input placeholder="2024-25" disabled={isView} />
        </Form.Item>

        {/* Status */}
        <Form.Item label="Status">
          <Text
            strong
            style={{
              color: enrollment?.isActive ? "var(--success)" : "var(--danger)",
            }}
          >
            {enrollment?.isActive ? "Active" : "Inactive"}
          </Text>
        </Form.Item>

        {/* Created At */}
        {enrollment?.createdAt && (
          <Form.Item label="Enrolled On">
            <Text type="secondary">
              {new Date(enrollment.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};
