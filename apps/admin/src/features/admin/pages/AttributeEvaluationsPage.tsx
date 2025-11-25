import { useState, useEffect } from "react";
import { Input, Modal, message, Typography, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DataTable, type Column } from "@/components/common/DataTable";
import { AttributeEvaluationDrawer } from "@/components/attributeEvaluations/AttributeEvaluationDrawer";
import {
  useAttributeEvaluations,
  type IAttributeEvaluation,
} from "@/hooks/useAttributeEvaluations";
import { useForm } from "antd/es/form/Form";
import { useAttributeCategories } from "@/hooks/useAttributeCategories";

const { Text } = Typography;

export default function AttributeEvaluationsPage() {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    evaluations,
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
  } = useAttributeEvaluations({ search: searchText, pagination });

  const { categories } = useAttributeCategories({
    pagination: { page: 1, pageSize: 10 },
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchText]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<IAttributeEvaluation | null>(null);
  const [form] = useForm();

  const openDrawer = (
    evaluation: IAttributeEvaluation | null,
    mode: "view" | "edit" | "create",
    extraData?: {
      studentId: string;
      studentEnrollmentId: string;
      teacherId: string;
    }
  ) => {
    setSelectedEvaluation(evaluation);
    setDrawerMode(mode);

    if (evaluation && mode !== "create") {
      form.setFieldsValue({
        studentId: evaluation.studentId?._id,
        studentEnrollmentId: evaluation.studentEnrollmentId?._id,
        teacherId: evaluation.teacherId._id,
        remark: evaluation.remark || "",
      });
    } else if (mode === "create" && extraData) {
      form.setFieldsValue(extraData);
    } else {
      form.resetFields();
    }

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedEvaluation(null);
    form.resetFields();
  };

  const handleView = (record: IAttributeEvaluation) =>
    openDrawer(record, "view");
  const handleEdit = (record: IAttributeEvaluation) =>
    openDrawer(record, "edit");

  const handleNewEvaluation = (record: IAttributeEvaluation) => {
    const studentId = record.studentId?._id;
    const enrollmentId = record.studentEnrollmentId?._id;
    const teacherId = record.teacherId._id;

    if (!studentId || !enrollmentId) {
      message.warning("Cannot create evaluation: missing student data.");
      return;
    }

    openDrawer(null, "create", {
      studentId,
      studentEnrollmentId: enrollmentId,
      teacherId,
    });
  };

  const handleDelete = (key: React.Key) => {
    Modal.confirm({
      title: "Delete Evaluation",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await remove(String(key));
          message.success("Evaluation deleted");
        } catch {
          message.error("Failed to delete evaluation");
        }
      },
    });
  };

  const handleBulkDelete = (keys: React.Key[]) => {
    if (!keys.length) return;
    Modal.confirm({
      title: `Delete ${keys.length} evaluation${keys.length > 1 ? "s" : ""}?`,
      onOk: async () => {
        try {
          await removeMany(keys.map(String));
          message.success("Deleted");
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (drawerMode === "view") return;

    try {
      const values = await form.validateFields();

      const attributes = categories.flatMap((cat) => {
        const score = values.score?.[cat._id];
        if (score === undefined) return [];
        return [
          {
            attributeId: cat._id,
            score,
            comment: values.comment?.[cat._id] || undefined,
          },
        ];
      });

      const payload = {
        studentId: values.studentId,
        studentEnrollmentId: values.studentEnrollmentId,
        teacherId: values.teacherId,
        attributes,
        remark: values.remark,
      };

      if (drawerMode === "create") {
        await create(payload);
        message.success("Evaluation created");
      } else if (selectedEvaluation) {
        await update(selectedEvaluation._id, payload);
        message.success("Evaluation updated");
      }
      closeDrawer();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error("Operation failed");
    }
  };

  const columns = [
    {
      key: "student",
      title: "Student",
      render: (record: IAttributeEvaluation) => (
        <Text strong>
          {record.studentId?.firstName} {record.studentId?.lastName}
        </Text>
      ),
    },
    {
      key: "grade",
      title: "Grade + Year",
      width: 140,
      render: (record: IAttributeEvaluation) => (
        <div>
          <Tag color="blue">{record.studentEnrollmentId?.gradeId.level}</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.studentEnrollmentId?.schoolYear}
          </Text>
        </div>
      ),
    },
    {
      key: "teacher",
      title: "Teacher",
      render: (record: IAttributeEvaluation) =>
        `${record.teacherId.firstName} ${record.teacherId.lastName}`,
    },
    {
      key: "date",
      title: "Date",
      width: 130,
      render: (record: IAttributeEvaluation) =>
        new Date(record.createdAt).toLocaleDateString(),
    },
    {
      key: "totalScore",
      title: "Total Score",
      width: 120,
      render: (record: IAttributeEvaluation) => (
        <Tag
          color={
            record.totalScore >= 80
              ? "green"
              : record.totalScore >= 60
              ? "orange"
              : "red"
          }
        >
          <strong>{record.totalScore}</strong>
        </Tag>
      ),
    },
  ] satisfies Column<IAttributeEvaluation>[];

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Attribute Evaluations</h2>
        <Text type="secondary">Admin monitoring tool — use with care</Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by student, teacher, or grade..."
          prefix={<SearchOutlined />}
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      <DataTable
        data={evaluations}
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
        extraRowActions={(record) => [
          {
            key: "new-evaluation",
            label: "New Evaluation (Admin Override)",
            onClick: () => handleNewEvaluation(record),
            danger: true,
          },
        ]}
      />

      <AttributeEvaluationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        evaluation={selectedEvaluation}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
