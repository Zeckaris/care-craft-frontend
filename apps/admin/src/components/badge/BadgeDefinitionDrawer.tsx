import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Upload,
  Select,
  Tag,
  Typography,
  List,
  Divider,
  Alert,
} from "antd";
import {
  UploadOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import { useState, useEffect } from "react";
import type { IBadgeDefinition } from "@/hooks/useBadgeDefinitions";

const { Text } = Typography;
const { TextArea } = Input;

interface BadgeDefinitionDrawerProps {
  open: boolean;
  onClose: () => void;
  definition: IBadgeDefinition | null;
  mode: "view" | "create" | "edit";
  form: FormInstance;
  onSubmit: (values: Partial<IBadgeDefinition>, iconFile: File | null) => void;
  loading?: boolean;
  availableCriteria?: { value: string; label: string }[];
  levelOptions?: { value: number; label: string }[];
}

export const BadgeDefinitionDrawer = ({
  open,
  onClose,
  definition,
  mode,
  form,
  onSubmit,
  loading = false,
  availableCriteria = [],
  levelOptions = [
    { value: 1, label: "Level 1 (Bronze)" },
    { value: 2, label: "Level 2 (Silver)" },
    { value: 3, label: "Level 3 (Gold)" },
    { value: 4, label: "Level 4 (Platinum)" },
  ],
}: BadgeDefinitionDrawerProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";

  // Local state for file and preview
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>(
    definition?.icon || "",
  );

  const hasNoCriteriaAvailable = availableCriteria.length === 0;

  // Handle file selection
  const handleUploadChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj as File;
    if (file) {
      setIconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };

  // Reset on open/change mode
  useEffect(() => {
    if (open) {
      setIconPreview(definition?.icon || "");
      setIconFile(null);
    }
  }, [open, mode, definition]);

  // Cleanup on close (revoke blob URL)
  const handleClose = () => {
    if (iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(null);
    setIconPreview("");
    onClose();
  };

  // Handle submit button (validate and pass to parent)
  const handleDrawerSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values, iconFile);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={48}
            icon={<TrophyOutlined />}
            src={iconPreview || undefined}
            style={{ backgroundColor: "#f56a00" }}
          />
          {isView
            ? definition?.name || "Badge Details"
            : isCreate
              ? "Create New Badge Definition"
              : "Edit Badge Definition"}
        </Space>
      }
      width={680}
      onClose={handleClose}
      open={open}
      destroyOnClose
      extra={
        !isView && (
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleDrawerSubmit}
              loading={loading}
            >
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
          name: definition?.name || "",
          description: definition?.description || "",
          level: definition?.level || 1,
          criteria: definition?.criteria.map((c) => c._id) || [],
        }}
      >
        {/* Icon Upload/Preview  */}
        <Form.Item label="Badge Icon (optional)">
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <Avatar
              size={120}
              icon={<TrophyOutlined />}
              src={iconPreview || undefined}
              style={{ backgroundColor: "#f56a00" }}
            />
            {!isView && (
              <>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>
                    {iconFile ? "Change Icon" : "Upload Icon"}
                  </Button>
                </Upload>
                <Text type="secondary">
                  Recommended: square image (e.g., 256x256)
                </Text>
              </>
            )}
            {isView && !iconPreview && (
              <Text type="secondary">No icon set</Text>
            )}
          </Space>
        </Form.Item>

        {/* Name & Level */}
        <Space style={{ display: "flex" }} size="large">
          <Form.Item
            name="name"
            label="Badge Name"
            rules={[{ required: true, message: "Badge name is required" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Communication Excellence" />
          </Form.Item>

          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Level is required" }]}
          >
            <Select options={levelOptions} style={{ width: 180 }} />
          </Form.Item>
        </Space>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <TextArea
            placeholder="Describe what this badge represents and why it's awarded..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        {/* Criteria Selection */}
        <Form.Item
          name="criteria"
          label="Criteria (optional — add later if needed)"
        >
          {isView ? (
            <List
              bordered
              dataSource={definition?.criteria || []}
              locale={{ emptyText: "No criteria defined yet" }}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical">
                    <Text strong>
                      {item.type.replace(/([A-Z])/g, " $1").trim()}
                    </Text>
                    <Text type="secondary">{item.description || "—"}</Text>
                    {(item.minScore ||
                      item.minProgress ||
                      item.minObservations) && (
                      <Space>
                        {item.minScore && <Tag>Min Score: {item.minScore}</Tag>}
                        {item.minProgress && (
                          <Tag>Min Progress: {item.minProgress}%</Tag>
                        )}
                        {item.minObservations && (
                          <Tag>Min Observations: {item.minObservations}</Tag>
                        )}
                        {item.scope && (
                          <Tag>
                            {item.scope === "yearly" ? "Yearly" : "All Time"}
                          </Tag>
                        )}
                      </Space>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <>
              <Select
                mode="multiple"
                placeholder="Select existing criteria (optional)"
                options={availableCriteria}
                optionFilterProp="label"
                allowClear
              />
              {hasNoCriteriaAvailable && (
                <Alert
                  message="No criteria available yet"
                  description={
                    <>
                      You can save this badge now and add criteria later from
                      the <strong>Criteria</strong> tab.
                    </>
                  }
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  style={{ marginTop: 12 }}
                />
              )}
            </>
          )}
        </Form.Item>

        {/* Created By (view only) */}
        {isView && definition?.createdBy && (
          <>
            <Divider />
            <Space>
              <Text type="secondary">Created by:</Text>
              <Text strong>
                {definition.createdBy.firstName} {definition.createdBy.lastName}
              </Text>
            </Space>
          </>
        )}
      </Form>
    </Drawer>
  );
};
