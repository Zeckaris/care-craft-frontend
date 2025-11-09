import { useState, useMemo, useEffect } from "react";
import { Table, Input, Button, Skeleton, Popconfirm } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ActionColumn } from "./ActionColumn";

interface DataType {
  id: string | number;
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
  rowKey?: keyof T | ((record: T) => string);
  searchPlaceholder?: string;
  emptyText?: string;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (id: T["id"]) => void;
  onBulkDelete?: (ids: T["id"][]) => void;
}

export function DataTable<T extends DataType>({
  data,
  columns,
  loading = false,
  rowKey = "id" as keyof T,
  searchPlaceholder = "Search...",
  emptyText = "No data found",
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: DataTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const term = searchText.toLowerCase();
    return data.filter((record) =>
      Object.values(record).some((v) =>
        v?.toString().toLowerCase().includes(term)
      )
    );
  }, [data, searchText]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [data]);

  const getRowKey = (record: T): string =>
    typeof rowKey === "function" ? rowKey(record) : String(record[rowKey]);

  // Fixed: Prevent "select all" bug
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    type: "checkbox" as const, // Critical fix
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
    // Use ActionColumn — no inline icons
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
          onDelete={onDelete}
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
        <Input
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          allowClear
        />
        <div style={{ flex: 1 }} />
        {hasSelected && onBulkDelete && (
          <Popconfirm
            title={`Delete ${selectedRowKeys.length} item${
              selectedRowKeys.length > 1 ? "s" : ""
            }?`}
            onConfirm={() => {
              onBulkDelete(selectedRowKeys as T["id"][]);
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText }}
        />
      )}
    </div>
  );
}
