import { Form, Select, Input, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useStudents } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useEffect } from "react";

const { Option } = Select;

interface EnrollmentFormRowProps {
  name: number; // Form.List index
  remove: (index: number) => void;
  isFirst: boolean;
}

export const EnrollmentFormRow = ({
  name,
  remove,
  isFirst,
}: EnrollmentFormRowProps) => {
  const { students } = useStudents({ pagination: { page: 1, pageSize: 1000 } });
  const { grades } = useGrades();

  // Filter out already enrolled students (optional — can enhance later)
  const availableStudents = students.filter((s) => !s.enrollmentId?.isActive);

  return (
    <Space
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 8,
        padding: "8px 12px",
        background: "var(--bg-secondary)",
        borderRadius: 6,
        border: "1px solid var(--border)",
      }}
      size="middle"
    >
      {/* Student Select */}
      <Form.Item
        name={[name, "studentId"]}
        rules={[{ required: true, message: "Select student" }]}
        style={{ marginBottom: 0, flex: 1, minWidth: 220 }}
      >
        <Select
          showSearch
          placeholder="Search student..."
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {availableStudents.map((student) => (
            <Option
              key={student._id}
              value={student._id}
              label={`${student.firstName} ${student.lastName}`}
            >
              <Space>
                <span>
                  {student.firstName} {student.middleName} {student.lastName}
                </span>
                {student.enrollmentId && (
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: 12 }}
                  >
                    (Already in {student.enrollmentId.gradeId.level})
                  </span>
                )}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Grade Select */}
      <Form.Item
        name={[name, "gradeId"]}
        rules={[{ required: true, message: "Select grade" }]}
        style={{ marginBottom: 0, flex: 1, minWidth: 160 }}
      >
        <Select placeholder="Grade">
          {grades.map((grade) => (
            <Option key={grade._id} value={grade._id}>
              {grade.level}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* School Year */}
      <Form.Item
        name={[name, "schoolYear"]}
        style={{ marginBottom: 0, width: 120 }}
      >
        <Input placeholder="2024-25" />
      </Form.Item>

      {/* Remove Button */}
      {!isFirst && (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => remove(name)}
          style={{ marginLeft: 8 }}
        />
      )}
    </Space>
  );
};
