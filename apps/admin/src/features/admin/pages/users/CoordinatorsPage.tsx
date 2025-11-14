import { useState } from "react";
import { Form, Input, message, Space, Typography, Alert, Avatar } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { UserEditDrawer, type IUser } from "@/components/users/UserEditDrawer";
import { UserDeleteConfirm } from "@/components/users/UserDeleteConfirm";
import { useCoordinators } from "@/hooks/useCoordinators";
import dayjs from "dayjs";
import type { Key } from "antd/es/table/interface";

const { Text } = Typography;

export default function CoordinatorsPage() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    coordinators,
    total,
    isLoading,
    isError,
    fetchError,
    refetch,
    update,
    remove,
    isUpdating,
    isDeleting,
  } = useCoordinators({ page: currentPage, pageSize });

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

  // Filter coordinators client-side for search
  const filteredCoordinators = searchText
    ? coordinators.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          c.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
          c.email.toLowerCase().includes(searchText.toLowerCase()) ||
          (c.phoneNumber &&
            c.phoneNumber.toLowerCase().includes(searchText.toLowerCase()))
      )
    : coordinators;

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
    const user = coordinators.find((c) => c._id === key);
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
      message.success("Coordinator deleted successfully");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete coordinator";
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
      message.success("Coordinator updated successfully");
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
        <h2>Coordinators</h2>
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
          placeholder="Search coordinators..."
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
            message="Failed to load coordinators"
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
      {coordinators.length === 0 && !isLoading ? (
        <EmptyState
          title="No coordinators found"
          description="There are currently no coordinators in the system."
          buttonText="Refresh"
          onClick={refetch}
        />
      ) : (
        <DataTable
          data={filteredCoordinators}
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
