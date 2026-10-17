import { Avatar, Space, Tag, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { AssignmentStudent } from "./studentAssignmentUtils";
import { studentFullName } from "./studentAssignmentUtils";

const { Text } = Typography;

export function StudentCell({ student }: { student: AssignmentStudent }) {
  return (
    <Space>
      <Avatar
        size="small"
        icon={<UserOutlined />}
        src={student.profileImage || undefined}
        style={{ backgroundColor: "var(--primary)" }}
      />
      <Text strong>{studentFullName(student)}</Text>
    </Space>
  );
}

export function GenderTag({ gender }: { gender?: string }) {
  if (!gender) return <Text type="secondary">—</Text>;
  const color =
    gender === "male" ? "blue" : gender === "female" ? "magenta" : "default";
  return (
    <Tag color={color}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Tag>
  );
}
