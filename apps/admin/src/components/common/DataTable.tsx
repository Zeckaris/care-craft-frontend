import { useState } from "react";
import { Table, Button, Skeleton, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ActionColumn } from "./ActionColumn";

interface DataType {
  _id: string | number;
}

export interface Column<T extends DataType> {
  key: keyof T | string;
  title: string;
  render?: (record: T) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  width?: number;
}

interface ExtraAction<T> {
  key: string;
  label: string;
  onClick: (record: T) => void;
  danger?: boolean;
}

interface DataTableProps<T extends DataType> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => React.Key);
  searchPlaceholder?: string;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (key: React.Key) => void;
  onBulkDelete?: (keys: React.Key[]) => void;
  pagination?: false | import("antd").TablePaginationConfig;
  extraRowActions?: (record: T) => ExtraAction<T>[];
}

export function DataTable<T extends DataType>({
  data,
  columns,
  loading = false,
  rowKey = "_id" as keyof T,
  emptyText = "No data found",
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  pagination,
  extraRowActions,
}: DataTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getRowKey = (record: T): React.Key => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    const key = record[rowKey];
    if (key != null) return key as React.Key;
    console.warn("DataTable: Missing _id, using fallback", record);
    return Math.random();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    type: "checkbox" as const,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const userColumns = columns.map((col): ColumnsType<T>[number] => ({
    title: col.title,
    dataIndex: String(col.key),
    key: String(col.key),
    width: col.width,
    sorter: col.sorter,
    render: (_value: unknown, record: T) =>
      col.render
        ? col.render(record)
        : ((record[col.key as keyof T] ?? "-") as React.ReactNode),
  }));

  const hasRowActions = Boolean(
    onView || onEdit || onDelete || extraRowActions
  );

  const antdColumns: ColumnsType<T> = hasRowActions
    ? [
        ...userColumns,
        {
          title: "Actions",
          key: "actions",
          fixed: "right" as const,
          width: 120,
          render: (_value: unknown, record: T) => (
            <ActionColumn
              record={record}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              extraActions={extraRowActions?.(record)}
            />
          ),
        },
      ]
    : userColumns;

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }} />
        {hasSelected && onBulkDelete && (
          <Popconfirm
            title={`Delete ${selectedRowKeys.length} item${
              selectedRowKeys.length > 1 ? "s" : ""
            }?`}
            onConfirm={() => {
              onBulkDelete(selectedRowKeys);
              setSelectedRowKeys([]);
            }}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger>Delete Selected ({selectedRowKeys.length})</Button>
          </Popconfirm>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table<T>
          columns={antdColumns}
          dataSource={data}
          rowKey={getRowKey}
          rowSelection={onBulkDelete ? rowSelection : undefined}
          pagination={
            pagination === false
              ? false
              : pagination ?? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }
          }
          scroll={{ x: "max-content" }}
          locale={{ emptyText }}
          onRow={(record) => ({
            onClick: onRowClick ? () => onRowClick(record) : undefined,
            style: onRowClick ? { cursor: "pointer" } : undefined,
          })}
        />
      )}
    </div>
  );
}
