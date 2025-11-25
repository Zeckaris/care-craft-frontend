import { Space, Tooltip, Dropdown, Menu } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";

interface ExtraAction<T> {
  key: string;
  label: string;
  onClick: (record: T) => void;
  danger?: boolean;
}

interface ActionColumnProps<T extends Record<string, any>> {
  record: T;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (key: Key) => void;
  extraActions?: ExtraAction<T>[];
}

export function ActionColumn<T extends Record<string, any>>({
  record,
  onView,
  onEdit,
  onDelete,
  extraActions,
}: ActionColumnProps<T>) {
  const getKey = (): Key => {
    if ("_id" in record && record._id != null) return record._id as Key;
    if ("id" in record && record.id != null) return record.id as Key;
    console.warn("ActionColumn: No _id or id found", record);
    return Math.random().toString();
  };

  const key = getKey();

  const defaultActions = (
    <>
      {onView && (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{
              color: "var(--action-view)",
              cursor: "pointer",
              fontSize: 16,
              transition: "color 0.2s ease",
            }}
            onClick={() => onView(record)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--action-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--action-view)";
            }}
          />
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Edit">
          <EditOutlined
            style={{
              color: "var(--action-edit)",
              cursor: "pointer",
              fontSize: 16,
              transition: "color 0.2s ease",
            }}
            onClick={() => onEdit(record)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--action-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--action-edit)";
            }}
          />
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete">
          <DeleteOutlined
            style={{
              color: "var(--action-delete)",
              cursor: "pointer",
              fontSize: 16,
              transition: "color 0.2s ease",
            }}
            onClick={() => onDelete(key)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--action-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--action-delete)";
            }}
          />
        </Tooltip>
      )}
    </>
  );

  if (!extraActions || extraActions.length === 0) {
    return <Space size="small">{defaultActions}</Space>;
  }

  const menuItems = extraActions.map((action) => ({
    key: action.key,
    label: action.label,
    danger: action.danger,
    onClick: () => action.onClick(record),
  }));

  return (
    <Space size="small">
      {defaultActions}
      <Dropdown overlay={<Menu items={menuItems} />} trigger={["click"]}>
        <MoreOutlined
          style={{
            cursor: "pointer",
            fontSize: 18,
            color: "#666",
          }}
        />
      </Dropdown>
    </Space>
  );
}
