import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface UserDeleteConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  userName?: string;
}

export const UserDeleteConfirm = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  userName = "this user",
}: UserDeleteConfirmProps) => {
  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#faad14", marginRight: 8 }}
          />
          Confirm Delete
        </span>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true, loading }}
      width={420}
    >
      <p>
        Are you sure you want to delete <strong>{userName}</strong>?
      </p>
      <p style={{ marginBottom: 0, color: "#8c8c8c" }}>
        This action <strong>cannot be undone</strong> and will permanently
        remove the user from the system.
      </p>
    </Modal>
  );
};
