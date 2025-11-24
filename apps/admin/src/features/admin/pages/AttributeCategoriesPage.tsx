import { useState, useEffect } from "react";
import { Button, Input, Modal, message, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { AttributeCategoryDrawer } from "@/components/attributeCategories/AttributeCategoryDrawer";
import {
  useAttributeCategories,
  type IAttributeCategory,
} from "@/hooks/useAttributeCategories";
import { useForm } from "antd/es/form/Form";

const { Text } = Typography;

export default function AttributeCategoriesPage() {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    categories,
    total,
    currentPage,
    pageSize,
    isLoading,
    create,
    update,
    remove,
    removeMany,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAttributeCategories({ search: searchText, pagination });

  // Reset page on search
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchText]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "create"
  );
  const [selectedCategory, setSelectedCategory] =
    useState<IAttributeCategory | null>(null);
  const [form] = useForm();

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id?: string;
  }>({
    open: false,
  });

  const openDrawer = (
    category: IAttributeCategory | null,
    mode: "view" | "edit" | "create"
  ) => {
    setSelectedCategory(category);
    setDrawerMode(mode);

    if (category && mode !== "create") {
      form.setFieldsValue({
        name: category.name,
        description: category.description || "",
        minScore: category.minScore,
        maxScore: category.maxScore,
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCategory(null);
    form.resetFields();
  };

  const handleView = (cat: IAttributeCategory) => openDrawer(cat, "view");
  const handleEdit = (cat: IAttributeCategory) => openDrawer(cat, "edit");
  const handleCreate = () => openDrawer(null, "create");

  const handleDelete = (key: React.Key) => {
    setDeleteConfirm({ open: true, id: String(key) });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await remove(deleteConfirm.id);
      message.success("Attribute category deleted");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to delete category"
      );
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  const handleBulkDelete = (keys: React.Key[]) => {
    if (keys.length === 0) return;

    Modal.confirm({
      title: `Delete ${keys.length} attribute categor${
        keys.length > 1 ? "ies" : "y"
      }?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} categories deleted`);
        } catch {
          message.error("Failed to delete some categories");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedCategory) {
        await update(selectedCategory._id, values);
        message.success("Category updated successfully");
      } else {
        await create(values);
        message.success("Category created successfully");
      }
      closeDrawer();
    } catch (err: any) {
      if (err?.errorFields) return; // Form validation error
      const msg = err?.response?.data?.message || "Operation failed";
      message.error(msg);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Category Name",
      render: (cat: IAttributeCategory) => <Text strong>{cat.name}</Text>,
      sorter: (a: IAttributeCategory, b: IAttributeCategory) =>
        a.name.localeCompare(b.name),
    },
    {
      key: "description",
      title: "Description",
      render: (cat: IAttributeCategory) =>
        cat.description ? (
          cat.description
        ) : (
          <em style={{ opacity: 0.6 }}>No description</em>
        ),
    },
    {
      key: "range",
      title: "Score Range",
      render: (cat: IAttributeCategory) => (
        <Text strong>
          {cat.minScore} – {cat.maxScore}
        </Text>
      ),
      width: 120,
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
        <h2>Attribute Categories</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search categories by name..."
          prefix={<SearchOutlined />}
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      {/* Table */}
      <DataTable
        data={categories}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, size) =>
            setPagination({ page, pageSize: size || 10 }),
        }}
      />

      {/* Delete Confirmation */}
      <Modal
        title="Confirm Delete"
        open={deleteConfirm.open}
        onOk={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        confirmLoading={isDeleting}
      >
        <p>Are you sure you want to delete this attribute category?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Drawer */}
      <AttributeCategoryDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        category={selectedCategory}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
