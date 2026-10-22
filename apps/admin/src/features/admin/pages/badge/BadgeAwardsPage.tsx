import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Form,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, TrophyOutlined } from "@ant-design/icons";
import type { StudentBadge, StudentBadgeSource } from "@carecraft/types";
import { extractApiErrorMessage } from "@carecraft/query-core";
import { DataTable } from "@/components/common/DataTable";
import { BadgeAwardDrawer } from "@/components/badge/BadgeAwardDrawer";
import BadgeProgressTab from "@/features/admin/pages/badge/BadgeProgressTab";
import { useAllBadgeDefinitions } from "@/hooks/useBadgeDefinitions";
import { useStudentBadges } from "@/hooks/useStudentBadges";
import { useStudents } from "@/hooks/useStudents";
import { useTerms } from "@/hooks/useAssessmentResults";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserSearch } from "@/hooks/useUserSearch";
import { formatDateTime } from "@/utils/dateFormat";
import {
  STUDENT_BADGE_SOURCE_OPTIONS,
  getBadgeLevelLabel,
  getStudentBadgeSourceMeta,
} from "@/utils/badges";

const { Title, Text } = Typography;

export default function BadgeAwardsPage() {
  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: 8 }}>
      <Tabs
        defaultActiveKey="awards"
        items={[
          {
            key: "awards",
            label: "Awards",
            children: <BadgeAwardsTab />,
          },
          {
            key: "progress",
            label: "Progress",
            children: <BadgeProgressTab />,
          },
        ]}
      />
    </div>
  );
}

function BadgeAwardsTab() {
  const { user } = useCurrentUser();
  const canFilterAwardedBy =
    user?.role === "admin" || user?.role === "coordinator";

  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [badgeId, setBadgeId] = useState<string | undefined>(undefined);
  const [schoolYear, setSchoolYear] = useState<string | undefined>(undefined);
  const [academicTermId, setAcademicTermId] = useState<string | undefined>(
    undefined,
  );
  const [source, setSource] = useState<StudentBadgeSource | undefined>(
    undefined,
  );
  const [awardedBy, setAwardedBy] = useState<string | undefined>(undefined);
  const [awardedByLabel, setAwardedByLabel] = useState<string | undefined>(
    undefined,
  );
  const [awardedByQuery, setAwardedByQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const {
    awards,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
  } = useStudentBadges({
    studentId,
    badgeId,
    schoolYear,
    academicTermId,
    source,
    awardedBy: canFilterAwardedBy ? awardedBy : undefined,
    pagination,
  });

  const { students } = useStudents({
    pagination: { page: 1, pageSize: 1000 },
  });
  const { definitions } = useAllBadgeDefinitions();
  const { data: terms = [], isLoading: termsLoading } = useTerms();
  const { users: awardedByUsers, loading: awardedByLoading } =
    useUserSearch(awardedByQuery);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student._id,
        label: `${student.firstName} ${student.lastName}`,
      })),
    [students],
  );

  const badgeOptions = useMemo(
    () =>
      definitions.map((definition) => ({
        value: definition._id,
        label: `${definition.name} (${getBadgeLevelLabel(definition.level)})`,
      })),
    [definitions],
  );

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    terms.forEach((term) => {
      const year = term.calendarId?.academicYear;
      if (year) years.add(year);
    });
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => ({ value, label: value }));
  }, [terms]);

  const termOptions = useMemo(
    () =>
      terms
        .filter(
          (term) =>
            !schoolYear || term.calendarId?.academicYear === schoolYear,
        )
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((term) => ({
          value: term._id,
          label: schoolYear
            ? term.name
            : `${term.name} (${term.calendarId?.academicYear ?? ""})`,
        })),
    [terms, schoolYear],
  );

  const awardedByOptions = useMemo(() => {
    const options = awardedByUsers.map((awardedByUser) => ({
      value: awardedByUser.id,
      label: awardedByUser.fullName,
    }));
    if (
      awardedBy &&
      awardedByLabel &&
      !options.some((option) => option.value === awardedBy)
    ) {
      options.unshift({ value: awardedBy, label: awardedByLabel });
    }
    return options;
  }, [awardedByUsers, awardedBy, awardedByLabel]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [
    studentId,
    badgeId,
    schoolYear,
    academicTermId,
    source,
    awardedBy,
  ]);

  useEffect(() => {
    if (!academicTermId || !schoolYear) return;
    const selectedTerm = terms.find((term) => term._id === academicTermId);
    if (
      selectedTerm &&
      selectedTerm.calendarId?.academicYear !== schoolYear
    ) {
      setAcademicTermId(undefined);
    }
  }, [academicTermId, schoolYear, terms]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">(
    "view",
  );
  const [selectedAward, setSelectedAward] = useState<StudentBadge | null>(null);
  const [form] = Form.useForm();

  const openAwardDrawer = (
    award: StudentBadge | null,
    mode: "view" | "create" | "edit",
  ) => {
    setSelectedAward(award);
    setDrawerMode(mode);
    if (mode === "edit" && award) {
      form.setFieldsValue({ note: award.note || "" });
    } else if (mode === "create") {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedAward(null);
    form.resetFields();
  };

  const handleAward = () => openAwardDrawer(null, "create");
  const handleView = (award: StudentBadge) => openAwardDrawer(award, "view");
  const handleEdit = (award: StudentBadge) => openAwardDrawer(award, "edit");

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (drawerMode === "create") {
        await create({
          studentId: values.studentId,
          badgeId: values.badgeId,
          note: values.note?.trim() || undefined,
        });
      } else if (drawerMode === "edit" && selectedAward) {
        await update(selectedAward._id, {
          note: values.note?.trim() || "",
        });
      }
      closeDrawer();
    } catch (error: any) {
      if (error?.errorFields) return;
      // Backend errors are shown by useApi.
    }
  };

  const handleRevoke = (key: React.Key) => {
    const award = awards.find((item) => item._id === String(key));
    const studentName = award?.studentId
      ? `${award.studentId.firstName} ${award.studentId.lastName}`
      : "this student";

    Modal.confirm({
      title: "Revoke Badge Award",
      content: (
        <div>
          <p>
            Revoke this badge award for {studentName}? This action cannot be
            undone.
          </p>
          <p>
            If this is a system award, it will not be recreated automatically
            for that term.
          </p>
        </div>
      ),
      okText: "Revoke",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove(String(key));
          setSelectedAward((current) =>
            current?._id === String(key) ? null : current,
          );
        } catch {
          // Backend errors are shown by useApi.
        }
      },
    });
  };

  const columns = [
    {
      key: "student",
      title: "Student",
      render: (record: StudentBadge) =>
        record.studentId ? (
          <Text strong>
            {record.studentId.firstName} {record.studentId.lastName}
          </Text>
        ) : (
          <Text type="secondary">Deleted student</Text>
        ),
    },
    {
      key: "badge",
      title: "Badge",
      render: (record: StudentBadge) => (
        <Space>
          <Avatar
            size={32}
            icon={<TrophyOutlined />}
            src={record.badgeId?.icon || undefined}
            style={{ backgroundColor: "#f56a00" }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.badgeId?.name || "Deleted badge"}</Text>
            <Text type="secondary">
              {getBadgeLevelLabel(record.badgeId?.level)}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      key: "term",
      title: "Term",
      render: (record: StudentBadge) => {
        const term =
          record.academicTermId && typeof record.academicTermId !== "string"
            ? record.academicTermId
            : null;
        return (
          <Space direction="vertical" size={0}>
            <Text>{term?.name || "-"}</Text>
            <Text type="secondary">{record.schoolYear || "-"}</Text>
          </Space>
        );
      },
    },
    {
      key: "source",
      title: "Source",
      render: (record: StudentBadge) => {
        const meta = getStudentBadgeSourceMeta(record.source);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      key: "awardedBy",
      title: "Awarded By",
      render: (record: StudentBadge) =>
        record.awardedBy && record.awardedBy.firstName
          ? `${record.awardedBy.firstName} ${record.awardedBy.lastName}`
          : "System",
    },
    {
      key: "note",
      title: "Note",
      render: (record: StudentBadge) => (
        <Text ellipsis={{ tooltip: record.note || "" }} style={{ maxWidth: 200 }}>
          {record.note || "-"}
        </Text>
      ),
    },
    {
      key: "createdAt",
      title: "Date",
      render: (record: StudentBadge) => formatDateTime(record.createdAt),
    },
  ];

  return (
    <>
      <div>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0 }}>
                Student Badge Awards
              </Title>
              <Text type="secondary">
                Award, edit and revoke student badges
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAward}
            >
              Award Badge
            </Button>
          </div>

          <Space wrap>
            <Select
              style={{ width: 240 }}
              placeholder="Filter by Student"
              allowClear
              showSearch
              optionFilterProp="label"
              options={studentOptions}
              value={studentId}
              onChange={(value) => setStudentId(value || undefined)}
            />
            <Select
              style={{ width: 260 }}
              placeholder="Filter by Badge"
              allowClear
              showSearch
              optionFilterProp="label"
              options={badgeOptions}
              value={badgeId}
              onChange={(value) => setBadgeId(value || undefined)}
            />
            <Select
              style={{ width: 180 }}
              placeholder="Filter by School Year"
              allowClear
              showSearch
              optionFilterProp="label"
              options={yearOptions}
              loading={termsLoading}
              value={schoolYear}
              onChange={(value) => setSchoolYear(value || undefined)}
            />
            <Select
              style={{ width: 220 }}
              placeholder="Filter by Term"
              allowClear
              showSearch
              optionFilterProp="label"
              options={termOptions}
              loading={termsLoading}
              value={academicTermId}
              onChange={(value) => setAcademicTermId(value || undefined)}
            />
            <Select
              style={{ width: 160 }}
              placeholder="Filter by Source"
              allowClear
              options={STUDENT_BADGE_SOURCE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={source}
              onChange={(value) => setSource(value || undefined)}
            />
            {canFilterAwardedBy && (
              <Select
                style={{ width: 240 }}
                placeholder="Filter by Awarded By"
                allowClear
                showSearch
                filterOption={false}
                onSearch={setAwardedByQuery}
                loading={awardedByLoading}
                options={awardedByOptions}
                value={awardedBy}
                onChange={(value) => {
                  setAwardedBy(value || undefined);
                  setAwardedByLabel(
                    awardedByOptions.find((option) => option.value === value)
                      ?.label,
                  );
                }}
                notFoundContent={
                  awardedByQuery.trim().length < 2
                    ? "Type at least 2 characters to search"
                    : "No users found"
                }
              />
            )}
          </Space>

          {isError && fetchError && (
            <Alert
              type="error"
              message="Failed to load badge awards"
              description={extractApiErrorMessage(fetchError)}
              showIcon
            />
          )}

          {awards.length === 0 && !isLoading ? (
            <Empty description="No badge awards yet">
              <Button type="primary" onClick={handleAward}>
                Award the First Badge
              </Button>
            </Empty>
          ) : (
            <DataTable
              data={awards}
              columns={columns}
              loading={isLoading}
              rowKey="_id"
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleRevoke}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (page, size) =>
                  setPagination({ page, pageSize: size || 10 }),
              }}
            />
          )}
        </Space>
      </div>

      <BadgeAwardDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        award={selectedAward}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating || isDeleting}
        studentOptions={studentOptions}
        badgeOptions={badgeOptions}
      />
    </>
  );
}
