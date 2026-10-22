import { Drawer, Form, Input, Button, Space, Upload, message } from "antd";
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";
import {
  type ISchoolInfo,
  type SchoolInfoCreateInput,
  useSchoolInfo,
} from "@/hooks/useSchoolInfo";

const { TextArea } = Input;

const TELEPHONE_MAX_ITEMS = 5;
const TELEPHONE_MIN_LENGTH = 6;
const TELEPHONE_MAX_LENGTH = 20;
const TELEPHONE_PATTERN = /^[0-9+\-() ]+$/;
const ABOUT_MAX_LENGTH = 2000;

const TELEPHONE_REQUIRED_ERROR = "At least one telephone number is required";
const TELEPHONE_FORMAT_ERROR =
  "telephone entries must be 6-20 characters using digits, spaces, +, -, (, )";
const TELEPHONE_DUPLICATE_ERROR = "Telephone numbers must be unique";

interface SchoolInfoFormValues {
  name: string;
  address: string;
  contactEmail: string;
  about?: string;
  telephone?: (string | undefined)[];
}

interface SchoolInfoDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: ISchoolInfo;
  onClose: () => void;
  onSuccess: () => void;
}

const buildInitialValues = (data?: ISchoolInfo) => ({
  name: data?.name ?? "",
  address: data?.address ?? "",
  contactEmail: data?.contactEmail ?? "",
  about: data?.about ?? "",
  telephone:
    data?.telephone && data.telephone.length > 0
      ? data.telephone.slice(0, TELEPHONE_MAX_ITEMS)
      : [""],
});

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
  const [form] = Form.useForm<SchoolInfoFormValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (mode === "create") {
        resetLogo();
      }
    }
  }, [open, mode, form, resetLogo]);

  const handleSubmit = async (values: SchoolInfoFormValues) => {
    const telephone = (values.telephone ?? [])
      .map((value) => (value ?? "").trim())
      .filter(Boolean);

    const data: SchoolInfoCreateInput = {
      name: values.name,
      address: values.address,
      contactEmail: values.contactEmail,
      about: values.about?.trim() ?? "",
      telephone,
      logo: logoFile,
    };

    try {
      if (mode === "create") {
        await create(data);
      } else {
        await update(data);
      }
      onSuccess();
    } catch {
      // Errors are surfaced by useApi.
    }
  };

  const handleClose = () => {
    form.resetFields();
    resetLogo();
    onClose();
  };

  const uploadProps = {
    onRemove: () => {
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
      return false; // Prevent auto upload
    },
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
        initialValues={buildInitialValues(initialData)}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Logo Upload */}
        <Form.Item label="School Logo">
          <Upload {...uploadProps} listType="picture-card">
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
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

        {/* Telephone list */}
        <Form.List
          name="telephone"
          rules={[
            {
              validator: async (_, value?: (string | undefined)[]) => {
                const entries = (value ?? []).filter(
                  (entry) => (entry ?? "").trim() !== ""
                );
                if (mode === "create" && entries.length === 0) {
                  throw new Error(TELEPHONE_REQUIRED_ERROR);
                }
                if (entries.length > TELEPHONE_MAX_ITEMS) {
                  throw new Error(
                    `You can add up to ${TELEPHONE_MAX_ITEMS} telephone numbers`
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <Form.Item label="Telephone" required>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ marginBottom: 0, flex: 1, minWidth: 320 }}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value?: string) {
                          const trimmed = (value ?? "").trim();
                          if (!trimmed) return Promise.resolve();
                          if (
                            trimmed.length < TELEPHONE_MIN_LENGTH ||
                            trimmed.length > TELEPHONE_MAX_LENGTH ||
                            !TELEPHONE_PATTERN.test(trimmed)
                          ) {
                            return Promise.reject(
                              new Error(TELEPHONE_FORMAT_ERROR)
                            );
                          }
                          const all = (getFieldValue("telephone") ??
                            []) as (string | undefined)[];
                          const duplicates = all.filter(
                            (entry) => (entry ?? "").trim() === trimmed
                          ).length;
                          if (duplicates > 1) {
                            return Promise.reject(
                              new Error(TELEPHONE_DUPLICATE_ERROR)
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input
                      placeholder="+251 911 123 456"
                      size="large"
                      disabled={isSaving}
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length === 1 || isSaving}
                    aria-label="Remove telephone number"
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add("")}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= TELEPHONE_MAX_ITEMS || isSaving}
              >
                Add Telephone
              </Button>
            </Form.Item>
          )}
        </Form.List>

        {/* About */}
        <Form.Item name="about" label="About">
          <TextArea
            rows={4}
            maxLength={ABOUT_MAX_LENGTH}
            showCount
            placeholder="Tell parents and staff about the school"
            disabled={isSaving}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
