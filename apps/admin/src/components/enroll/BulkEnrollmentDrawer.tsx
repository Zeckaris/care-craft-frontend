import { Drawer, Form, Button, Space, Typography, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { EnrollmentFormRow } from "./EnrollmentFormRow";
import { useState } from "react";

const { Text } = Typography;

interface BulkEnrollmentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export const BulkEnrollmentDrawer = ({
  open,
  onClose,
  onSubmit,
  loading,
}: BulkEnrollmentDrawerProps) => {
  const [form] = Form.useForm();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      setHasSubmitted(true);
      const values = await form.validateFields();
      const enrollments = values.enrollments || [];

      const cleanEnrollments = enrollments.filter(
        (e: any) => e.studentId && e.gradeId
      );

      if (cleanEnrollments.length === 0) {
        return;
      }

      await onSubmit({
        studentIds: cleanEnrollments.map((e: any) => e.studentId),
        gradeId: cleanEnrollments[0].gradeId,
        schoolYear: cleanEnrollments[0].schoolYear,
      });

      form.resetFields();
      onClose();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <PlusOutlined />
          Enroll Multiple Students
        </Space>
      }
      width={800}
      onClose={() => {
        form.resetFields();
        setHasSubmitted(false);
        onClose();
      }}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Enroll Students
          </Button>
        </Space>
      }
    >
      <Alert
        message="All students will be enrolled in the same grade and school year."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical">
        <Form.List name="enrollments" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <EnrollmentFormRow
                  key={field.key}
                  name={field.name}
                  remove={remove}
                  isFirst={index === 0}
                />
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 8 }}
              >
                Add Another Student
              </Button>

              {hasSubmitted && fields.length === 0 && (
                <Text type="danger" style={{ display: "block", marginTop: 8 }}>
                  Add at least one student
                </Text>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};
