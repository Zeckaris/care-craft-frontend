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
  message,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { IStudent } from "@/hooks/useStudents";
import { useState, useEffect } from "react";
import type { UploadProps } from "antd";
import { ASSETS_BASE } from "@/services/api-client";

const { Text } = Typography;

interface StudentDrawerProps {
  open: boolean;
  onClose: () => void;
  student: IStudent | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: (formData: FormData) => Promise<void>;
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

  const [fileList, setFileList] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const displayImageSrc =
    previewUrl ||
    (student?.profileImage?.startsWith("http")
      ? student.profileImage
      : student?.profileImage
        ? `${ASSETS_BASE}${student.profileImage}`
        : null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      setProfileFile(null);

      if (student) {
        if (isEdit) {
          form.setFieldsValue({
            firstName: student.firstName,
            middleName: student.middleName || "",
            lastName: student.lastName,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth
              ? dayjs(student.dateOfBirth)
              : null,
          });
        }
      } else {
        setPreviewUrl(null);
      }
    }
  }, [open, student, isEdit, form]);

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewUrl(null);
      setProfileFile(null);
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }

      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileList([file]);

      return Upload.LIST_IGNORE;
    },
    fileList,
    maxCount: 1,
    listType: "picture-card" as const,
  };

  const handleDrawerClose = () => {
    form.resetFields();
    setFileList([]);
    setPreviewUrl(null);
    setProfileFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "dateOfBirth" && value) {
          formData.append(key, (value as dayjs.Dayjs).toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (profileFile) {
        formData.append("profileImage", profileFile);
      }

      await onSubmit(formData);
    } catch (err) {}
  };

  return (
    <Drawer
      title={
        <Space>
          {isView && (
            <Avatar
              size={48}
              icon={<UserOutlined />}
              src={displayImageSrc} // ← changed to use the computed value
            />
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
      onClose={handleDrawerClose}
      open={open}
      extra={
        isEdit && (
          <Space>
            <Button onClick={handleDrawerClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {student ? "Update" : "Create"}
            </Button>
          </Space>
        )
      }
    >
      <Form form={form} layout="vertical" disabled={isView}>
        {/* Profile Image */}
        <Form.Item label="Profile Image">
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <Avatar
              size={96}
              icon={<UserOutlined />}
              src={displayImageSrc} // ← changed to use the computed value
            />
            {isEdit && (
              <Upload {...uploadProps}>
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            )}
            {isEdit && <Text type="secondary">JPG, PNG, GIF • max 5MB</Text>}
            {isView && !previewUrl && <Text type="secondary">No photo</Text>}
          </Space>
        </Form.Item>

        {/* Names */}
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
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
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

        {/* Read-only fields in view/edit */}
        <Form.Item label="Admission Date">
          <Input
            value={
              student?.admissionDate
                ? dayjs(student.admissionDate).format("MMMM D, YYYY")
                : "—"
            }
            disabled
          />
        </Form.Item>

        {student?.enrollmentId && (
          <Form.Item label="Current Grade">
            <Input
              value={student.enrollmentId.gradeId.level}
              disabled
              style={{ color: "var(--primary)", fontWeight: 500 }}
            />
          </Form.Item>
        )}

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
      </Form>
    </Drawer>
  );
};
