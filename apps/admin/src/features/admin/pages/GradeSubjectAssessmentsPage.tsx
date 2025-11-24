import { useState, useEffect } from "react";
import { Button, Input, Modal, Typography, message, Tag } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { GSADrawer } from "@/components/gsa/GSADrawer";
import { useGSA, type IGSA } from "@/hooks/useGSA";
import { useForm } from "antd/es/form/Form";

const { Text } = Typography;

export default function GradeSubjectAssessmentsPage() {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    gsas,
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
  } = useGSA({ search: searchText, pagination });

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchText]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "create"
  );
  const [selectedGSA, setSelectedGSA] = useState<IGSA | null>(null);
  const [form] = useForm();

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id?: string;
  }>({
    open: false,
  });

  const openDrawer = (gsa: IGSA | null, mode: "view" | "edit" | "create") => {
    setSelectedGSA(gsa);
    setDrawerMode(mode);

    if (gsa && mode !== "create") {
      form.setFieldsValue({
        gradeId: gsa.gradeId?._id,
        subjectId: gsa.subjectId?._id,
        assessmentSetupId: gsa.assessmentSetupId?._id || undefined,
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedGSA(null);
    form.resetFields();
  };

  const handleView = (gsa: IGSA) => openDrawer(gsa, "view");
  const handleEdit = (gsa: IGSA) => openDrawer(gsa, "edit");
  const handleCreate = () => openDrawer(null, "create");

  const handleDelete = (key: React.Key) => {
    setConfirmDelete({ open: true, id: String(key) });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    try {
      await remove(confirmDelete.id);
      message.success("GSA deleted successfully");
    } catch {
      message.error("Failed to delete GSA");
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const handleBulkDelete = (keys: React.Key[]) => {
    if (keys.length === 0) return;

    Modal.confirm({
      title: `Delete ${keys.length} GSA record${keys.length > 1 ? "s" : ""}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success(`${keys.length} GSA records deleted`);
        } catch {
          message.error("Failed to delete some records");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedGSA) {
        await update(selectedGSA._id, values);
        message.success("GSA updated successfully");
      } else {
        await create(values);
        message.success("GSA created successfully");
      }
      closeDrawer();
    } catch (err: any) {
      if (err?.errorFields) return;
      const backendMsg = err?.response?.data?.message || "Operation failed";
      message.error(backendMsg);
    }
  };

  const columns = [
    {
      key: "grade",
      title: "Grade",
      render: (gsa: IGSA) => (
        <Text strong>
          {gsa.gradeId?.level ?? (
            <span style={{ color: "var(--danger)" }}>Invalid Grade</span>
          )}
        </Text>
      ),
      sorter: (a: IGSA, b: IGSA) =>
        (a.gradeId?.level ?? "").localeCompare(b.gradeId?.level ?? ""),
    },
    {
      key: "subject",
      title: "Subject",
      render: (gsa: IGSA) => (
        <Text strong>
          {gsa.subjectId?.name ?? (
            <span style={{ color: "var(--danger)" }}>Invalid Subject</span>
          )}
        </Text>
      ),
    },
    {
      key: "setup",
      title: "Assessment Setup",
      render: (gsa: IGSA) => (
        <span>
          {gsa.assessmentSetupId?.name ?? "—"}
          {gsa.assessmentSetupId?.name === "Full Term Assessment" && (
            <Tag color="green" style={{ marginLeft: 6, fontSize: 10 }}>
              DEFAULT
            </Tag>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
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
        <h2>Grade Subject Assessments</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Link Subject to Grade
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by grade, subject or setup..."
          prefix={<SearchOutlined />}
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      <DataTable
        data={gsas}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, size) =>
            setPagination({ page, pageSize: size || 10 }),
        }}
      />

      <Modal
        title="Confirm Delete"
        open={confirmDelete.open}
        onOk={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        confirmLoading={isDeleting}
      >
        <p>Are you sure you want to delete this GSA record?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      <GSADrawer
        open={drawerOpen}
        onClose={closeDrawer}
        gsa={selectedGSA}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
