import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Dropdown,
  Empty,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { extractApiErrorMessage } from "@carecraft/query-core";
import type { IObservation } from "@carecraft/types";
import { DataTable } from "@/components/common/DataTable";
import { ObservationDetailDrawer } from "@/components/observations/ObservationDetailDrawer";
import { useObservations } from "@/hooks/useObservations";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { useSubjects } from "@/hooks/useSubjects";
import { useTerms } from "@/hooks/useAssessmentResults";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function formatObservationDate(value: string | null | undefined): string {
  if (!value) return "-";
  return dayjs(value.slice(0, 10)).format("MMM D, YYYY");
}

export default function ObservationsPage() {
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [teacherId, setTeacherId] = useState<string | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [schoolYear, setSchoolYear] = useState<string | undefined>(undefined);
  const [term, setTerm] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [selectedObservation, setSelectedObservation] =
    useState<IObservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null,
  );

  const {
    observations,
    total,
    currentPage,
    pageSize,
    isLoading,
    isError,
    fetchError,
    remove,
    bulkRemoveByStudent,
  } = useObservations({
    studentId,
    teacherId,
    subjectId,
    schoolYear,
    term,
    from,
    to,
    pagination,
  });

  // Load complete option lists for filters.
  const { students = [], isLoading: studentsLoading } = useStudents({
    pagination: { page: 1, pageSize: 1000 },
  });
  const { teachers = [], isLoading: teachersLoading } = useTeachers({
    page: 1,
    pageSize: 1000,
  });
  const { subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: terms = [], isLoading: termsLoading } = useTerms();

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [studentId, teacherId, subjectId, schoolYear, term, from, to]);

  // Clear a term that no longer belongs to the selected school year.
  useEffect(() => {
    if (!term || !schoolYear) return;
    const selectedTerm = terms.find((item) => item._id === term);
    if (
      selectedTerm &&
      selectedTerm.calendarId?.academicYear !== schoolYear
    ) {
      setTerm(undefined);
    }
  }, [term, schoolYear, terms]);

  const studentOptions = students.map((student) => ({
    value: student._id,
    label: `${student.firstName} ${student.lastName}`,
  }));

  const teacherOptions = teachers.map((teacher) => ({
    value: teacher._id,
    label: `${teacher.firstName} ${teacher.lastName}`,
  }));

  const subjectOptions = subjects.map((subject) => ({
    value: subject._id,
    label: subject.name,
  }));

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    terms.forEach((item) => {
      const year = item.calendarId?.academicYear;
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
          (item) =>
            !schoolYear || item.calendarId?.academicYear === schoolYear,
        )
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((item) => ({
          value: item._id,
          label: schoolYear
            ? item.name
            : `${item.name} (${item.calendarId?.academicYear ?? ""})`,
        })),
    [terms, schoolYear],
  );

  const termNameById = useMemo(
    () => new Map(terms.map((item) => [item._id, item.name])),
    [terms],
  );

  const getTermName = (termId: string | null | undefined): string => {
    if (!termId) return "-";
    return termNameById.get(termId) ?? "Unknown term";
  };

  const handleDelete = (record: IObservation) => {
    const studentName = record.studentId
      ? `${record.studentId.firstName} ${record.studentId.lastName}`
      : "this student";

    Modal.confirm({
      title: "Delete Observation",
      content: `Are you sure you want to permanently delete the observation for ${studentName}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingId(record._id);
        try {
          await remove(record._id);
          message.success("Observation deleted successfully");
          setSelectedObservation((current) =>
            current?._id === record._id ? null : current,
          );
        } catch {
          // Error handled by useApi
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleDeleteAllForStudent = (record: IObservation) => {
    const student = record.studentId;
    if (!student) return;

    const studentName = `${student.firstName} ${student.lastName}`;

    Modal.confirm({
      title: "Delete all observations for this student",
      content: `This permanently deletes every observation for ${studentName}. This action cannot be undone.`,
      okText: "Delete all",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingStudentId(student._id);
        try {
          await bulkRemoveByStudent(student._id);
          message.success(`All observations for ${studentName} deleted`);
          setSelectedObservation((current) =>
            current?.studentId?._id === student._id ? null : current,
          );
        } catch {
          // Error handled by useApi
        } finally {
          setDeletingStudentId(null);
        }
      },
    });
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (record: IObservation) => (
        <Space>
          <Text strong>
            {record.studentId ? (
              `${record.studentId.firstName} ${record.studentId.lastName}`
            ) : (
              <Text type="secondary">Deleted Student</Text>
            )}
          </Text>
        </Space>
      ),
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (record: IObservation) =>
        record.teacherId ? (
          `${record.teacherId.firstName} ${record.teacherId.lastName}`
        ) : (
          <Text type="secondary">Unknown Teacher</Text>
        ),
    },
    {
      title: "Subject",
      key: "subject",
      render: (record: IObservation) =>
        record.subjectId ? (
          <Tag>{record.subjectId.name}</Tag>
        ) : (
          <Text type="secondary">No subject</Text>
        ),
    },
    {
      title: "Date",
      key: "date",
      render: (record: IObservation) => formatObservationDate(record.date),
    },
    {
      title: "School Year",
      key: "schoolYear",
      render: (record: IObservation) => record.schoolYear || "-",
    },
    {
      title: "Term",
      key: "term",
      render: (record: IObservation) => getTermName(record.term),
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: IObservation) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            aria-label="View observation details"
            onClick={() => setSelectedObservation(record)}
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            aria-label="Delete observation"
            loading={deletingId === record._id}
            onClick={() => handleDelete(record)}
          />
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "delete-all",
                  label: "Delete all for this student",
                  danger: true,
                  disabled: !record.studentId,
                  onClick: () => handleDeleteAllForStudent(record),
                },
              ],
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              aria-label="More observation actions"
              loading={
                Boolean(record.studentId) &&
                deletingStudentId === record.studentId?._id
              }
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: 8 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>Observations</Title>
          <Text type="secondary">
            View all teacher-recorded student observations
          </Text>
        </div>

        {/* Filters */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Student"
            allowClear
            showSearch
            optionFilterProp="label"
            options={studentOptions}
            loading={studentsLoading}
            onChange={(value) => setStudentId(value || undefined)}
            value={studentId}
          />
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Teacher"
            allowClear
            showSearch
            optionFilterProp="label"
            options={teacherOptions}
            loading={teachersLoading}
            onChange={(value) => setTeacherId(value || undefined)}
            value={teacherId}
          />
          <Select
            style={{ width: 240 }}
            placeholder="Filter by Subject"
            allowClear
            showSearch
            optionFilterProp="label"
            options={subjectOptions}
            loading={subjectsLoading}
            onChange={(value) => setSubjectId(value || undefined)}
            value={subjectId}
          />
          <Select
            style={{ width: 180 }}
            placeholder="Filter by School Year"
            allowClear
            showSearch
            optionFilterProp="label"
            options={yearOptions}
            loading={termsLoading}
            onChange={(value) => setSchoolYear(value || undefined)}
            value={schoolYear}
          />
          <Select
            style={{ width: 220 }}
            placeholder="Filter by Term"
            allowClear
            showSearch
            optionFilterProp="label"
            options={termOptions}
            loading={termsLoading}
            onChange={(value) => setTerm(value || undefined)}
            value={term}
          />
          <RangePicker
            placeholder={["From date", "To date"]}
            value={
              from && to
                ? [dayjs(from), dayjs(to)]
                : null
            }
            onChange={(dates, dateStrings) => {
              if (!dates || !dates[0] || !dates[1]) {
                setFrom(undefined);
                setTo(undefined);
                return;
              }
              setFrom(dateStrings[0]);
              setTo(dateStrings[1]);
            }}
            format="YYYY-MM-DD"
          />
        </Space>

        {isError ? (
          <Alert
            type="error"
            message="Failed to load observations"
            description={
              fetchError
                ? extractApiErrorMessage(fetchError)
                : "Please try again"
            }
            showIcon
          />
        ) : !isLoading && observations.length === 0 ? (
          <Empty description="No observations recorded yet" />
        ) : (
          <DataTable
            data={observations}
            columns={columns}
            loading={isLoading}
            rowKey="_id"
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

        <ObservationDetailDrawer
          open={Boolean(selectedObservation)}
          observation={selectedObservation}
          termName={getTermName(selectedObservation?.term)}
          onClose={() => setSelectedObservation(null)}
        />
      </Space>
    </div>
  );
}
