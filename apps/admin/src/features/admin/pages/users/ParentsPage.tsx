import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Space,
  Typography,
  Alert,
  Avatar,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { UserEditDrawer, type IUser } from "@/components/users/UserEditDrawer";
import { UserDeleteConfirm } from "@/components/users/UserDeleteConfirm";
import { useParents } from "@/hooks/useParents";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function ParentsPage() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    parents,
    total,
    isLoading,
    isError,
    fetchError,
    refetch,
    update,
    remove,
    isUpdating,
    isDeleting,
  } = useParents({ page: currentPage, pageSize });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [form] = Form.useForm();

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    key?: Key;
    userName?: string;
  }>({
    open: false,
  });

  // Filter parents client-side for search
  const filteredParents = searchText
    ? parents.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          p.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
          p.email.toLowerCase().includes(searchText.toLowerCase()) ||
          (p.phoneNumber &&
            p.phoneNumber.toLowerCase().includes(searchText.toLowerCase()))
      )
    : parents;

  const openDrawer = (user: IUser | null, mode: "view" | "edit") => {
    setSelectedUser(user);
    setDrawerMode(mode);
    if (user && mode === "edit") {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const handleView = (user: IUser) => openDrawer(user, "view");
  const handleEdit = (user: IUser) => openDrawer(user, "edit");

  const handleDelete = (key: Key) => {
    const user = parents.find((p) => p._id === key);
    if (user) {
      setDeleteConfirm({
        open: true,
        key,
        userName: `${user.firstName} ${user.lastName}`,
      });
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm.key) return;
    try {
      await remove(String(deleteConfirm.key));
      message.success("Parent deleted successfully");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete parent";
      message.error(msg);
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    try {
      const values = await form.validateFields();
      await update(selectedUser._id, values);
      message.success("Parent updated successfully");
      closeDrawer();
    } catch (err: any) {
      console.error("Update error:", err);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      sorter: (a: IUser, b: IUser) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
      render: (user: IUser) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          <Text strong>{`${user.firstName} ${user.lastName}`}</Text>
        </Space>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (user: IUser) => <Text>{user.email}</Text>,
    },
    {
      key: "phoneNumber",
      title: "Phone",
      render: (user: IUser) =>
        user.phoneNumber ? (
          <Text>{user.phoneNumber}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (user: IUser) =>
        user.createdAt ? dayjs(user.createdAt).format("MMM D, YYYY") : "—",
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2>Parents</h2>
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Search parents..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
        />
      </div>

      {/* Error Alert */}
      {isError && fetchError && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            message="Failed to load parents"
            description={
              fetchError.message || "Check console or try again later"
            }
            showIcon
            closable
            onClose={() => refetch()}
          />
        </div>
      )}

      {/* Empty State */}
      {parents.length === 0 && !isLoading ? (
        <EmptyState
          title="No parents found"
          description="There are currently no parents in the system."
          buttonText="Refresh"
          onClick={refetch}
        />
      ) : (
        <DataTable
          data={filteredParents}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            total,
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page) => setCurrentPage(page),
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={undefined} // Disabled
        />
      )}

      {/* Edit/View Drawer */}
      <UserEditDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        user={selectedUser}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isUpdating}
      />

      {/* Delete Confirm Modal */}
      <UserDeleteConfirm
        open={deleteConfirm.open}
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteConfirm({ open: false })}
        loading={isDeleting}
        userName={deleteConfirm.userName}
      />
    </>
  );
}
