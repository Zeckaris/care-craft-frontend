import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import type { FormInstance } from "antd";
import type { StudentBadge } from "@carecraft/types";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { formatDateTime } from "@/utils/dateFormat";
import {
  getBadgeLevelLabel,
  getStudentBadgeSourceMeta,
} from "@/utils/badges";

const { Text } = Typography;
const { TextArea } = Input;

interface BadgeAwardDrawerProps {
  open: boolean;
  onClose: () => void;
  award: StudentBadge | null;
  mode: "view" | "create" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
  studentOptions: { value: string; label: string }[];
  badgeOptions: { value: string; label: string }[];
}

export const BadgeAwardDrawer = ({
  open,
  onClose,
  award,
  mode,
  form,
  onSubmit,
  loading = false,
  studentOptions,
  badgeOptions,
}: BadgeAwardDrawerProps) => {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const studentName = award?.studentId
    ? `${award.studentId.firstName} ${award.studentId.lastName}`
    : "-";
  const badgeName = award?.badgeId?.name ?? "-";
  const termName =
    award?.academicTermId && typeof award.academicTermId !== "string"
      ? award.academicTermId.name
      : "-";
  const awardedByName =
    award?.awardedBy && award.awardedBy.firstName
      ? `${award.awardedBy.firstName} ${award.awardedBy.lastName}`
      : "System";
  const sourceMeta = getStudentBadgeSourceMeta(award?.source);

  const renderReadOnlyAward = () => (
    <Space direction="vertical" style={{ width: "100%" }}>
      <ReadOnlyField label="Student" value={studentName} />
      <ReadOnlyField
        label="Badge"
        value={
          award?.badgeId
            ? `${badgeName} (${getBadgeLevelLabel(award.badgeId.level)})`
            : "-"
        }
      />
      <ReadOnlyField
        label="How to Earn"
        value={award?.badgeId?.howToEarn}
      />
      <ReadOnlyField label="Term" value={termName} />
      <ReadOnlyField label="School Year" value={award?.schoolYear} />
      <ReadOnlyField label="Source" value={sourceMeta.label} />
      <ReadOnlyField label="Awarded By" value={awardedByName} />
      <ReadOnlyField label="Note" value={award?.note} />
      <ReadOnlyField
        label="Awarded On"
        value={formatDateTime(award?.createdAt)}
      />
    </Space>
  );

  return (
    <Drawer
      title={
        isView
          ? "Badge Award Details"
          : isCreate
            ? "Award Badge"
            : "Edit Badge Award"
      }
      width={640}
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        !isView && (
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {isCreate ? "Award Badge" : "Update Note"}
            </Button>
          </Space>
        )
      }
    >
      {isView ? (
        <Form layout="vertical" disabled>
          {renderReadOnlyAward()}
        </Form>
      ) : isEdit ? (
        <Form form={form} layout="vertical">
          <ReadOnlyField label="Student" value={studentName} />
          <ReadOnlyField
            label="Badge"
            value={
              award?.badgeId
                ? `${badgeName} (${getBadgeLevelLabel(award.badgeId.level)})`
                : "-"
            }
          />
          <ReadOnlyField
            label="How to Earn"
            value={award?.badgeId?.howToEarn}
          />
          <ReadOnlyField label="Term" value={termName} />
          <ReadOnlyField label="School Year" value={award?.schoolYear} />
          <Form.Item name="note" label="Note">
            <TextArea
              placeholder="Optional note about this award..."
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
        </Form>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true, message: "Select a student" }]}
          >
            <Select
              placeholder="Select a student"
              options={studentOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="badgeId"
            label="Badge"
            rules={[{ required: true, message: "Select a badge" }]}
          >
            <Select
              placeholder="Select a badge"
              options={badgeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <TextArea
              placeholder="Optional note about this award..."
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          <Text type="secondary">
            Eligibility is checked by the backend when you award the badge.
          </Text>
        </Form>
      )}
    </Drawer>
  );
};
