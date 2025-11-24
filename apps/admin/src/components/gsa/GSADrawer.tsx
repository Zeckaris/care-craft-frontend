import {
  Drawer,
  Descriptions,
  Form,
  Select,
  Button,
  Space,
  Tag,
  Typography,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { type IGSA } from "@/hooks/useGSA";
import { useGrades } from "@/hooks/useGrades";
import { useSubjects } from "@/hooks/useSubjects";
import { useAssessmentSetups } from "@/hooks/useAssessmentSetups";

const { Text } = Typography;

interface GSADrawerProps {
  open: boolean;
  onClose: () => void;
  gsa: IGSA | null;
  mode: "view" | "edit" | "create";
  form: any;
  onSubmit: () => void;
  loading?: boolean;
}

export function GSADrawer({
  open,
  onClose,
  gsa,
  mode,
  form,
  onSubmit,
  loading = false,
}: GSADrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  // These hooks take **no arguments** in your project
  const { grades, isLoading: gradesLoading } = useGrades();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { setups: assessmentSetups, isLoading: setupsLoading } =
    useAssessmentSetups();

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "-";

  const defaultSetup = assessmentSetups.find(
    (s) => s.name === "Full Term Assessment"
  );

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
          <span>
            {isView
              ? "GSA Details"
              : isCreate
              ? "Link Subject to Grade"
              : "Edit Grade-Subject Assessment"}
          </span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        !isView && (
          <div style={{ textAlign: "right", padding: "8px 0" }}>
            <Space>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" onClick={onSubmit} loading={loading}>
                {isCreate ? "Create" : "Save Changes"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Grade">
            <Text strong>{gsa?.gradeId.level}</Text>
            {gsa?.gradeId.description && <div>{gsa.gradeId.description}</div>}
          </Descriptions.Item>
          <Descriptions.Item label="Subject">
            <Text strong>{gsa?.subjectId.name}</Text>
            {gsa?.subjectId.description && (
              <div>{gsa.subjectId.description}</div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Assessment Setup">
            <Text strong>{gsa?.assessmentSetupId.name}</Text>
            {gsa?.assessmentSetupId.description && (
              <div>{gsa.assessmentSetupId.description}</div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(gsa?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(gsa?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="gradeId"
            label="Grade"
            rules={[{ required: true, message: "Please select a grade" }]}
          >
            <Select
              placeholder="Select grade"
              loading={gradesLoading}
              disabled={loading}
              showSearch
              optionFilterProp="children"
            >
              {grades.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subjectId"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select subject"
              loading={subjectsLoading}
              disabled={loading}
              showSearch
              optionFilterProp="children"
            >
              {subjects.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="assessmentSetupId" label="Assessment Setup">
            <Select
              placeholder={
                defaultSetup
                  ? `Default: ${defaultSetup.name} (will be used if empty)`
                  : "Select assessment setup (optional)"
              }
              loading={setupsLoading}
              disabled={loading}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {assessmentSetups.map((setup) => (
                <Select.Option key={setup._id} value={setup._id}>
                  <div>
                    {setup.name}
                    {setup.name === "Full Term Assessment" && (
                      <Tag
                        color="green"
                        style={{ marginLeft: 8, fontSize: 10 }}
                      >
                        DEFAULT
                      </Tag>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
