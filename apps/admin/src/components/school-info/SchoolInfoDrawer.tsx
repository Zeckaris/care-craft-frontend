import { Drawer, Form, Input, Button, Space, Upload, message } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { type ISchoolInfo, useSchoolInfo } from "@/hooks/useSchoolInfo";

const { TextArea } = Input;

interface SchoolInfoDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: ISchoolInfo;
  onClose: () => void;
  onSuccess: () => void;
}

export const SchoolInfoDrawer = ({
  open,
  mode,
  initialData,
  onClose,
  onSuccess,
}: SchoolInfoDrawerProps) => {
  const {
    previewLogo,
    handleLogoChange,
    resetLogo,
    create,
    update,
    isSaving,
    logoFile,
  } = useSchoolInfo();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (mode === "create") {
        resetLogo();
        setFileList([]);
      }
    }
  }, [open, mode, form, resetLogo]);

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        logo: logoFile,
      };
      if (mode === "create") {
        await create(data);
      } else {
        await update(data);
      }
      onSuccess();
    } catch (err) {
      // ...
    }
  };

  const handleClose = () => {
    form.resetFields();
    resetLogo();
    setFileList([]);
    onClose();
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      resetLogo();
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      handleLogoChange(file);
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Drawer
      title={
        <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>
          {mode === "create" ? "Create School Profile" : "Edit School Info"}
        </span>
      }
      width={600}
      placement="right"
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSaving}
            onClick={() => form.submit()}
          >
            {isSaving ? <LoadingOutlined /> : "Save"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialData || {}}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Logo Upload */}
        <Form.Item label="School Logo">
          <Upload {...uploadProps} listType="picture-card">
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          {previewLogo && (
            <img
              src={previewLogo}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: 120,
                objectFit: "cover",
                marginTop: 8,
                borderRadius: 8,
              }}
            />
          )}
        </Form.Item>

        {/* Name */}
        <Form.Item
          name="name"
          label="School Name"
          rules={[{ required: true, message: "Please enter school name" }]}
        >
          <Input placeholder="e.g. CareCraft Academy" size="large" />
        </Form.Item>

        {/* Address */}
        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: "Please enter address" }]}
        >
          <TextArea rows={2} placeholder="Full school address" size="large" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="contactEmail"
          label="Contact Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="school@example.com" size="large" />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="contactPhone"
          label="Contact Phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="+251 911 123 456" size="large" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
