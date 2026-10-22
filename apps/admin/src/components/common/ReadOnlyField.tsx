import { Form, Input } from "antd";

interface ReadOnlyFieldProps {
  label: string;
  value?: string | number | null;
}

export const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => {
  const display =
    value === undefined || value === null || value === "" ? "-" : String(value);

  return (
    <Form.Item label={label}>
      <Input value={display} disabled />
    </Form.Item>
  );
};
