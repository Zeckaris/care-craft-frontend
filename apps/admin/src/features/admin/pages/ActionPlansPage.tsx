import { useState, useEffect } from "react";
import {
  Button,
  Space,
  Input,
  DatePicker,
  Select,
  Typography,
  message,
  Form,
  Modal,
  Progress,
  Tag,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/common/DataTable";
import { ActionPlanDrawer } from "@/components/actionPlan/ActionPlanDrawer";
import { useActionPlans } from "@/hooks/useActionPlans";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers"; // Create this if missing
import dayjs from "dayjs";
import type { IActionPlan } from "@/hooks/useActionPlans";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function ActionPlansPage() {
  const [searchText, setSearchText] = useState("");
  const [teacherId, setTeacherId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    plans,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    refetch,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
  } = useActionPlans({
    teacherId,
    startDate: dateRange[0] || undefined,
    endDate: dateRange[1] || undefined,
    search: searchText,
    pagination,
  });

  // Load options for drawer
  const { students: allStudents } = useStudents({});
  const { teachers: allTeachers } = useTeachers({});

  const studentOptions = allStudents.map((s) => ({
    value: s._id,
    label: `${s.firstName} ${s.lastName}`,
  }));

  const teacherOptions = allTeachers.map((t) => ({
    value: t._id,
    label: `${t.firstName} ${t.lastName}`,
  }));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">(
    "create"
  );
  const [selectedPlan, setSelectedPlan] = useState<IActionPlan | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchText, teacherId, dateRange]);

  const handleCreate = () => {
    setSelectedPlan(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      actionSteps: [
        { step: "", completed: false, responsibleParty: "teacher" },
      ],
    });
    setDrawerOpen(true);
  };

  const handleView = (record: IActionPlan) => {
    setSelectedPlan(record);
    setDrawerMode("view");
    setDrawerOpen(true);
  };

  const handleEdit = (record: IActionPlan) => {
    setSelectedPlan(record);
    setDrawerMode("edit");
    form.setFieldsValue({
      studentId: record.studentId._id,
      teacherId: record.teacherId._id,
      issue: record.issue,
      goal: record.goal,
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
      actionSteps: record.actionSteps.map((s) => ({
        step: s.step,
        completed: s.completed,
        responsibleParty: s.responsibleParty,
      })),
    });
    setDrawerOpen(true);
  };

  const handleDelete = (key: React.Key) => {
    const plan = plans.find((p) => p._id === key);
    if (!plan) return;

    Modal.confirm({
      title: "Delete Action Plan",
      content: `Are you sure you want to delete the plan for ${plan.studentId.firstName} ${plan.studentId.lastName}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await remove(key as string);
        message.success("Action plan deleted");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        studentId: values.studentId,
        teacherId: values.teacherId,
        issue: values.issue,
        goal: values.goal,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        actionSteps: values.actionSteps.filter(
          (s: any) => s.step?.trim() !== ""
        ),
      };

      if (drawerMode === "create") {
        await create(payload);
        message.success("Action plan created successfully");
      } else if (drawerMode === "edit" && selectedPlan) {
        await update(selectedPlan._id, payload);
        message.success("Action plan updated successfully");
      }

      setDrawerOpen(false);
      refetch();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (record: IActionPlan) => {
        if (!record.studentId) return <Text type="secondary">—</Text>;
        return (
          <Text strong>
            {record.studentId.firstName} {record.studentId.lastName}
          </Text>
        );
      },
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (record: IActionPlan) => {
        if (!record.teacherId) return <Text type="secondary">—</Text>;
        return `${record.teacherId.firstName} ${record.teacherId.lastName}`;
      },
    },
    {
      title: "Issue",
      key: "issue",
      dataIndex: "issue",
      ellipsis: true,
    },
    {
      title: "Goal",
      key: "goal",
      dataIndex: "goal",
      ellipsis: true,
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: IActionPlan) => {
        const completed = record.actionSteps.filter((s) => s.completed).length;
        const total = record.actionSteps.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <Space direction="vertical" size={4}>
            <Progress percent={percent} size="small" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {completed}/{total} steps
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Responsibility",
      key: "responsibility",
      render: (record: IActionPlan) => {
        const counts = {
          teacher: record.actionSteps.filter(
            (s) => s.responsibleParty === "teacher"
          ).length,
          parent: record.actionSteps.filter(
            (s) => s.responsibleParty === "parent"
          ).length,
          either: record.actionSteps.filter(
            (s) => s.responsibleParty === "either"
          ).length,
        };
        return (
          <Space size="small">
            {counts.teacher > 0 && <Tag color="blue">👩‍🏫 {counts.teacher}</Tag>}
            {counts.parent > 0 && <Tag color="green">👨‍👩‍👧 {counts.parent}</Tag>}
            {counts.either > 0 && (
              <Tag color="purple">Either {counts.either}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Dates",
      key: "dates",
      render: (record: IActionPlan) => (
        <Text>
          {dayjs(record.startDate).format("MMM D")} –{" "}
          {dayjs(record.endDate).format("MMM D, YYYY")}
        </Text>
      ),
    },
  ];

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            Action Plans
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Action Plan
          </Button>
        </div>

        {/* Filters */}
        <Space wrap>
          <Input
            placeholder="Search by student or issue..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by teacher"
            value={teacherId}
            onChange={setTeacherId}
            style={{ width: 200 }}
            allowClear
            options={teacherOptions}
            showSearch
            optionFilterProp="label"
          />

          <RangePicker
            placeholder={["Start date", "End date"]}
            value={[
              dateRange[0] ? dayjs(dateRange[0]) : null,
              dateRange[1] ? dayjs(dateRange[1]) : null,
            ]}
            onChange={(dates, dateStrings) => {
              setDateRange(dateStrings as [string, string]);
            }}
            format="YYYY-MM-DD"
          />
        </Space>

        <DataTable
          data={plans}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) =>
              setPagination({ page, pageSize: size || 10 }),
          }}
        />

        <ActionPlanDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          plan={selectedPlan}
          mode={drawerMode}
          form={form}
          onSubmit={handleSubmit}
          loading={isCreating || isUpdating}
          students={studentOptions}
          teachers={teacherOptions}
        />
      </Space>
    </>
  );
}
