// src/components/common/ActionColumn.tsx
import { Space, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Key } from "antd/es/table/interface";

// Allow any record with _id or id
interface ActionColumnProps<T extends Record<string, any>> {
  record: T;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (key: Key) => void;
}

export function ActionColumn<T extends Record<string, any>>({
  record,
  onView,
  onEdit,
  onDelete,
}: ActionColumnProps<T>) {
  // Safely extract key
  const getKey = (): Key => {
    if ("_id" in record && record._id != null) return record._id as Key;
    if ("id" in record && record.id != null) return record.id as Key;
    console.warn("ActionColumn: No _id or id found", record);
    return Math.random().toString();
  };

  const key = getKey();

  return (
    <Space size="small">
      {/* VIEW */}
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

      {/* EDIT */}
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

      {/* DELETE */}
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
    </Space>
  );
}
