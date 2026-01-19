import {
  Card,
  Typography,
  Input,
  Select,
  Button,
  AutoComplete,
  Spin,
  Form,
  message,
  Row,
  Col,
  Divider,
  Space,
} from "antd";
import { useState, useEffect } from "react";
import { useBroadcasts } from "@/hooks/useBroadcasts";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export const AnnouncementSection = () => {
  const {
    createBroadcast,
    updateBroadcast,
    drafts,
    draftLoading,
    fetchDrafts,
  } = useBroadcasts();

  const [form] = Form.useForm();

  const [draftSearch, setDraftSearch] = useState("");
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Only fetch drafts when search term actually changes
  useEffect(() => {
    const trimmed = draftSearch.trim();
    fetchDrafts(trimmed);
  }, [draftSearch]); // ← safe: string primitive, stable reference

  const handleSaveDraft = async () => {
    try {
      await form.validateFields();
      setSaving(true);
      const values = await form.getFieldsValue();

      await createBroadcast({
        ...values,
        status: "draft",
      });

      message.success("Draft saved successfully");
      form.resetFields();
      setSelectedDraft(null);
      setDraftSearch("");
    } catch {
      message.error("Please fill all required fields");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    try {
      await form.validateFields();
      setSending(true);
      const values = await form.getFieldsValue();

      if (selectedDraft) {
        await updateBroadcast(selectedDraft._id, {
          ...values,
          status: "sent",
        });
      } else {
        await createBroadcast({
          ...values,
          status: "sent",
        });
      }

      message.success("Announcement sent successfully");
      form.resetFields();
      setSelectedDraft(null);
      setDraftSearch("");
    } catch {
      message.error("Please fill all required fields");
    } finally {
      setSending(false);
    }
  };

  const handleSelectDraft = (id: string) => {
    const draft = drafts.find((d) => d._id === id);
    if (!draft) return;

    setSelectedDraft(draft);
    form.setFieldsValue({
      title: draft.title,
      body: draft.body,
      recipients: draft.recipients,
      priority: draft.priority,
    });
  };

  return (
    <Card
      title={
        <Space align="center">
          <span style={{ fontSize: "1.4em" }}>📢</span>
          <Title level={4} style={{ margin: 0 }}>
            Announcements
          </Title>
        </Space>
      }
      bordered={false}
      style={{
        marginBottom: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ priority: "normal", recipients: [] }}
        requiredMark="optional"
      >
        <Form.Item label={<Text strong>Load Draft</Text>}>
          <AutoComplete
            placeholder="Search drafts by title or recipients..."
            style={{ width: "100%", maxWidth: 520 }}
            options={drafts.map((d) => ({
              value: d._id,
              label: `${d.title} (${d.recipients.join(", ")})`,
            }))}
            onSearch={setDraftSearch}
            onSelect={handleSelectDraft}
            notFoundContent={
              draftLoading ? (
                <div style={{ padding: 12, textAlign: "center" }}>
                  <Spin size="small" />
                </div>
              ) : (
                "No drafts found"
              )
            }
            allowClear
            onClear={() => {
              setSelectedDraft(null);
              form.resetFields();
            }}
          />
        </Form.Item>

        <Divider />

        <Row gutter={[24, 0]}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Announcement title" size="large" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="body"
              label="Message"
              rules={[{ required: true, message: "Required" }]}
            >
              <TextArea
                rows={5}
                placeholder="Write your announcement here..."
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="recipients"
              label="Recipients"
              rules={[{ required: true, message: "Select at least one" }]}
            >
              <Select mode="multiple" size="large" placeholder="Select groups">
                <Option value="all">All</Option>
                <Option value="student">Students</Option>
                <Option value="parent">Parents</Option>
                <Option value="teacher">Teachers</Option>
                <Option value="coordinator">Coordinators</Option>
                <Option value="admin">Admins</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="priority" label="Priority">
              <Select size="large">
                <Option value="urgent">Urgent</Option>
                <Option value="normal">Normal</Option>
                <Option value="low">Low</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button size="large" onClick={handleSaveDraft} loading={saving}>
              Save Draft
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleSend}
              loading={sending}
            >
              {selectedDraft ? "Send Draft" : "Send Now"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};
