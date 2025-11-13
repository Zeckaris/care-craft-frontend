import { useState, useMemo, useEffect } from "react";
import { Table, Button, Skeleton, Popconfirm } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ActionColumn } from "./ActionColumn";

interface DataType {
  _id: string | number;
  [key: string]: any;
}

interface Column<T extends DataType> {
  key: keyof T | string;
  title: string;
  render?: (record: T) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  width?: number;
}

interface DataTableProps<T extends DataType> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => React.Key);
  searchPlaceholder?: string;
  emptyText?: string;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (key: React.Key) => void; // ← Fixed: React.Key
  onBulkDelete?: (keys: React.Key[]) => void; // ← Fixed: React.Key[]
  pagination?: false | import("antd").TablePaginationConfig;
}

export function DataTable<T extends DataType>({
  data,
  columns,
  loading = false,
  rowKey = "_id" as keyof T,
  searchPlaceholder = "Search...",
  emptyText = "No data found",
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  pagination,
}: DataTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");

  const filteredData = pagination
    ? data
    : useMemo(() => {
        if (!searchText) return data;
        const term = searchText.toLowerCase();
        return data.filter((record) =>
          Object.values(record).some((v) =>
            v?.toString().toLowerCase().includes(term)
          )
        );
      }, [data, searchText]);

  const getRowKey = (record: T): React.Key => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    const key = record[rowKey];
    if (key != null) return key;
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
    render: (_: any, record: T) =>
      col.render ? col.render(record) : record[col.key as keyof T] ?? "-",
  }));

  const antdColumns: ColumnsType<T> = [
    ...userColumns,
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: T) => (
        <ActionColumn
          record={record}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete} // ← Pass React.Key
        />
      ),
    },
  ];

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
          dataSource={filteredData}
          rowKey={getRowKey}
          rowSelection={rowSelection}
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
        />
      )}
    </div>
  );
}
