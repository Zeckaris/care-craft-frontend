import {
  Drawer,
  Form,
  Input,
  Radio,
  DatePicker,
  Avatar,
  Upload,
  Button,
  Space,
  Typography,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs"; // ← Only this!
import type { IStudent } from "@/hooks/useStudents";

const { Text } = Typography;

interface StudentDrawerProps {
  open: boolean;
  onClose: () => void;
  student: IStudent | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

export const StudentDrawer = ({
  open,
  onClose,
  student,
  mode,
  form,
  onSubmit,
  loading,
}: StudentDrawerProps) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  // dayjs helpers
  const toDayjs = (dateStr?: string) => (dateStr ? dayjs(dateStr) : undefined);
  const formatDate = (dateStr?: string) =>
    dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "—";

  const profileUrl = student?.profileImage || null;

  return (
    <Drawer
      title={
        <Space>
          {isView && (
            <Avatar size={48} icon={<UserOutlined />} src={profileUrl} />
          )}
          {isView
            ? `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
              "Student Details"
            : student
            ? "Edit Student"
            : "Add New Student"}
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
              {student ? "Update" : "Create"}
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
          firstName: student?.firstName || "",
          middleName: student?.middleName || "",
          lastName: student?.lastName || "",
          gender: student?.gender || "male",
          dateOfBirth: toDayjs(student?.dateOfBirth),
        }}
      >
        {/* Profile Image */}
        <Form.Item label="Profile Image">
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <Avatar size={96} icon={<UserOutlined />} src={profileUrl} />
            {isEdit && (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={(info) => {
                  if (info.fileList[0]?.originFileObj) {
                    const url = URL.createObjectURL(
                      info.fileList[0].originFileObj as Blob
                    );
                    form.setFieldsValue({ profileImage: url });
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Change Photo</Button>
              </Upload>
            )}
            {isEdit && <Text type="secondary">Image upload coming soon</Text>}
            {isView && !profileUrl && <Text type="secondary">No photo</Text>}
          </Space>
        </Form.Item>

        {/* Name Row */}
        <Space style={{ display: "flex" }} size="middle">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="John" />
          </Form.Item>

          <Form.Item name="middleName" label="Middle Name" style={{ flex: 1 }}>
            <Input placeholder="Michael" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Doe" />
          </Form.Item>
        </Space>

        {/* Gender & DOB */}
        <Space style={{ display: "flex" }} size="middle">
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="MMMM D, YYYY"
              placeholder="Select date"
            />
          </Form.Item>
        </Space>

        {/* Admission Date (read-only) */}
        <Form.Item label="Admission Date">
          <Input value={formatDate(student?.admissionDate)} disabled />
        </Form.Item>

        {/* Current Grade */}
        {student?.enrollmentId && (
          <Form.Item label="Current Grade">
            <Input
              value={student.enrollmentId.gradeId.level}
              disabled
              style={{ color: "var(--primary)", fontWeight: 500 }}
            />
          </Form.Item>
        )}

        {/* Parent */}
        {student?.parentId && (
          <Form.Item label="Parent/Guardian">
            <Input
              value={`${student.parentId.firstName} ${student.parentId.lastName}`}
              disabled
              prefix={<UserOutlined />}
            />
          </Form.Item>
        )}

        {isView && !student?.parentId && (
          <Form.Item label="Parent/Guardian">
            <Text type="secondary">Not assigned</Text>
          </Form.Item>
        )}

        {/* Hidden profile image field */}
        <Form.Item name="profileImage" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
