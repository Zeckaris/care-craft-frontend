import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  SaveOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { extractApiErrorMessage } from "@carecraft/query-core";
import {
  ATTENDANCE_STATUSES,
  type AttendanceAction,
  type AttendanceRecordInput,
  type AttendanceResultItem,
  type AttendanceRosterRow,
  type AttendanceStatus,
} from "@carecraft/types";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import {
  useAttendanceRoster,
  useAttendanceSchoolDay,
  useSaveAttendance,
} from "@/hooks/useAdminAttendance";
import { toSchoolDate } from "@/utils/schoolDate";

const { Title, Text } = Typography;

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

const RESULT_LABELS: Record<AttendanceAction, string> = {
  created: "created",
  updated: "updated",
  unchanged: "unchanged",
  skipped: "skipped",
  conflict: "conflict",
  rejected: "rejected",
};

const RESULT_ORDER: AttendanceAction[] = [
  "created",
  "updated",
  "unchanged",
  "skipped",
  "conflict",
  "rejected",
];

interface DraftValue {
  status: AttendanceStatus | null;
  note: string;
}

type DraftMap = Record<string, DraftValue>;

function buildDraft(roster: AttendanceRosterRow[]): DraftMap {
  const draft: DraftMap = {};
  for (const row of roster) {
    draft[row.studentId] = {
      status: row.status,
      note: row.note ?? "",
    };
  }
  return draft;
}

function studentName(row: AttendanceRosterRow): string {
  const fullName = row.fullName?.trim();
  if (fullName) return fullName;
  return (
    [row.firstName, row.middleName, row.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ") || "Unnamed student"
  );
}

function cleanNote(note: string | null | undefined): string {
  return (note ?? "").trim();
}

export default function AttendancePage() {
  const today = toSchoolDate(new Date());

  const [schoolYear, setSchoolYear] = useState("");
  const [gradeId, setGradeId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [date, setDate] = useState(today);
  const [draft, setDraft] = useState<DraftMap>({});
  const [saveResults, setSaveResults] = useState<AttendanceResultItem[] | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    calendars,
    currentCalendar,
    isLoading: calendarsLoading,
  } = useAcademicCalendars();
  const {
    grades,
    isLoading: gradesLoading,
    isError: gradesError,
  } = useGrades({ pagination: { page: 1, pageSize: 100 } });

  const {
    sections,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useSections({
    gradeId,
    schoolYear: schoolYear || undefined,
    isActive: true,
    pageSize: 100,
    enabled: Boolean(gradeId && schoolYear),
  });

  useEffect(() => {
    if (currentCalendar?.academicYear) {
      setSchoolYear((previous) => previous || currentCalendar.academicYear);
    }
  }, [currentCalendar]);

  const {
    schoolDay,
    isLoading: schoolDayLoading,
    error: schoolDayError,
    refetch: refetchSchoolDay,
  } = useAttendanceSchoolDay({
    date,
    schoolYear,
    enabled: Boolean(sectionId),
  });

  const {
    roster,
    isLoading: rosterLoading,
    isFetching: rosterFetching,
    error: rosterError,
    refetch: refetchRoster,
  } = useAttendanceRoster({
    sectionId,
    date,
    enabled: schoolDay?.isSchoolDay === true,
  });

  const { saveAttendance, isSaving } = useSaveAttendance();

  useEffect(() => {
    setDraft(buildDraft(roster));
  }, [roster]);

  const selectedSection = sections.find((section) => section._id === sectionId);
  const schoolYearOptions = useMemo(
    () =>
      calendars.map((calendar) => ({
        value: calendar.academicYear,
        label: calendar.isCurrent
          ? `${calendar.academicYear} (current)`
          : calendar.academicYear,
      })),
    [calendars],
  );

  const gradeOptions = useMemo(
    () => grades.map((grade) => ({ value: grade._id, label: grade.level })),
    [grades],
  );

  const sectionOptions = useMemo(
    () => sections.map((section) => ({ value: section._id, label: section.name })),
    [sections],
  );

  const markedCount = useMemo(
    () =>
      roster.reduce(
        (count, row) => count + (draft[row.studentId]?.status ? 1 : 0),
        0,
      ),
    [roster, draft],
  );

  const changedRecords = useMemo(() => {
    const records: AttendanceRecordInput[] = [];
    for (const row of roster) {
      const value = draft[row.studentId];
      if (!value?.status) continue;

      const note = cleanNote(value.note);
      const unchanged =
        value.status === row.status && note === cleanNote(row.note);
      if (unchanged) continue;

      records.push({
        studentId: row.studentId,
        status: value.status,
        note: note || undefined,
        expectedUpdatedAt: row.updatedAt,
      });
    }
    return records;
  }, [roster, draft]);

  const resultSummary = useMemo(() => {
    if (!saveResults) return null;

    const counts: Record<AttendanceAction, number> = {
      created: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      conflict: 0,
      rejected: 0,
    };
    for (const result of saveResults) {
      counts[result.action] += 1;
    }

    const text =
      RESULT_ORDER.filter((action) => counts[action] > 0)
        .map((action) => `${counts[action]} ${RESULT_LABELS[action]}`)
        .join(", ") || "No changes were applied";

    return { counts, text };
  }, [saveResults]);

  const resultDetails = useMemo(
    () =>
      (saveResults ?? []).filter(
        (result) =>
          result.action === "conflict" || result.action === "rejected",
      ),
    [saveResults],
  );

  const resultByStudent = useMemo(() => {
    const map = new Map<string, AttendanceAction>();
    for (const result of saveResults ?? []) {
      if (
        result.action === "conflict" ||
        result.action === "rejected" ||
        result.action === "skipped"
      ) {
        map.set(result.studentId, result.action);
      }
    }
    return map;
  }, [saveResults]);

  const rosterById = useMemo(
    () => new Map(roster.map((row) => [row.studentId, row])),
    [roster],
  );

  const clearResults = () => {
    setSaveResults(null);
    setSaveError(null);
  };

  const handleSchoolYearChange = (value: string) => {
    setSchoolYear(value);
    setSectionId(undefined);
    clearResults();
  };

  const handleGradeChange = (value: string | undefined) => {
    setGradeId(value);
    setSectionId(undefined);
    clearResults();
  };

  const handleSectionChange = (value: string | undefined) => {
    setSectionId(value);
    clearResults();
  };

  const handleDateChange = (value: Dayjs | null) => {
    if (!value) return;
    const next = value.format("YYYY-MM-DD");
    if (next > today) return;
    setDate(next);
    clearResults();
  };

  const handleStatusChange = (
    studentId: string,
    status: AttendanceStatus,
  ) => {
    setDraft((previous) => ({
      ...previous,
      [studentId]: {
        status,
        note: previous[studentId]?.note ?? "",
      },
    }));
    clearResults();
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setDraft((previous) => ({
      ...previous,
      [studentId]: {
        status: previous[studentId]?.status ?? null,
        note,
      },
    }));
    clearResults();
  };

  const handleMarkAllPresent = () => {
    setDraft((previous) => {
      const next: DraftMap = { ...previous };
      for (const row of roster) {
        next[row.studentId] = {
          status: "present",
          note: previous[row.studentId]?.note ?? row.note ?? "",
        };
      }
      return next;
    });
    clearResults();
  };

  const handleSave = async () => {
    if (!sectionId || changedRecords.length === 0) return;

    setSaveError(null);
    setSaveResults(null);

    try {
      const results = await saveAttendance(sectionId, date, changedRecords);
      setSaveResults(results);
      await refetchRoster();
    } catch (error) {
      setSaveError(extractApiErrorMessage(error));
    }
  };

  const columns: ColumnsType<AttendanceRosterRow> = [
    {
      title: "Student",
      key: "student",
      width: 260,
      render: (_, row) => {
        const outcome = resultByStudent.get(row.studentId);
        return (
          <Space direction="vertical" size={2}>
            <Text strong>{studentName(row)}</Text>
            {outcome && (
              <Tag
                color={
                  outcome === "conflict"
                    ? "warning"
                    : outcome === "rejected"
                      ? "error"
                      : "default"
                }
              >
                {RESULT_LABELS[outcome]}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 340,
      render: (_, row) => {
        const value = draft[row.studentId];
        return (
          <Space size={4} wrap>
            {ATTENDANCE_STATUSES.map((status) => {
              const active = value?.status === status;
              return (
                <Button
                  key={status}
                  size="small"
                  type={active ? "primary" : "default"}
                  aria-pressed={active}
                  onClick={() => handleStatusChange(row.studentId, status)}
                >
                  {STATUS_LABELS[status]}
                </Button>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Note",
      key: "note",
      width: 280,
      render: (_, row) => {
        const value = draft[row.studentId];
        return (
          <Input
            value={value?.note ?? ""}
            maxLength={280}
            placeholder={
              value?.status ? "Optional note" : "Select a status first"
            }
            disabled={!value?.status}
            onChange={(event) =>
              handleNoteChange(row.studentId, event.target.value)
            }
          />
        );
      },
    },
  ];

  const canShowRoster = Boolean(sectionId && date && schoolYear);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CheckSquareOutlined /> Attendance
        </Title>
        <Text type="secondary">
          Take attendance for a section when the regular teacher is unavailable.
        </Text>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap align="center" size={16}>
          <Space direction="vertical" size={2}>
            <Text strong>School year</Text>
            <Select
              value={schoolYear || undefined}
              options={schoolYearOptions}
              onChange={handleSchoolYearChange}
              placeholder="Select school year"
              loading={calendarsLoading}
              style={{ width: 190 }}
              showSearch
              optionFilterProp="label"
            />
          </Space>

          <Space direction="vertical" size={2}>
            <Text strong>Grade</Text>
            <Select
              value={gradeId}
              options={gradeOptions}
              onChange={handleGradeChange}
              placeholder="Select grade"
              loading={gradesLoading}
              status={gradesError ? "error" : undefined}
              style={{ width: 190 }}
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </Space>

          <Space direction="vertical" size={2}>
            <Text strong>Section</Text>
            <Select
              value={sectionId}
              options={sectionOptions}
              onChange={handleSectionChange}
              placeholder={
                gradeId ? "Select section" : "Select a grade first"
              }
              loading={sectionsLoading}
              status={sectionsError ? "error" : undefined}
              disabled={!gradeId || !schoolYear}
              style={{ width: 190 }}
              showSearch
              optionFilterProp="label"
            />
          </Space>

          <Space direction="vertical" size={2}>
            <Text strong>Date</Text>
            <DatePicker
              value={dayjs(date)}
              onChange={handleDateChange}
              allowClear={false}
              disabledDate={(current) =>
                current.format("YYYY-MM-DD") > today
              }
              style={{ width: 190 }}
            />
          </Space>
        </Space>
      </Card>

      {!schoolYear ? (
        <Alert
          type="info"
          showIcon
          message="Select a school year"
          description="Choose the academic year before taking attendance."
        />
      ) : !gradeId ? (
        <Alert
          type="info"
          showIcon
          message="Select a grade"
          description="Choose a grade to see its active sections."
        />
      ) : sectionsLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : sectionsError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load sections"
          description="Check your connection and try again."
        />
      ) : sections.length === 0 ? (
        <Empty description="No active sections exist for this grade and school year." />
      ) : !canShowRoster ? (
        <Alert
          type="info"
          showIcon
          message="Select a section"
          description="Choose an active section to load its attendance roster."
        />
      ) : schoolDayLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : schoolDayError ? (
        <Alert
          type="error"
          showIcon
          message="Could not check the school day"
          description={extractApiErrorMessage(schoolDayError)}
          action={
            <Button size="small" onClick={() => void refetchSchoolDay()}>
              Retry
            </Button>
          }
        />
      ) : schoolDay && !schoolDay.isSchoolDay ? (
        <Alert
          type="warning"
          showIcon
          message="This date is not a school day"
          description={
            schoolDay.reason ||
            "Attendance cannot be taken for the selected date."
          }
        />
      ) : (
        <>
          {saveError && (
            <Alert
              type="error"
              showIcon
              closable
              message="Could not save attendance"
              description={saveError}
              onClose={() => setSaveError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {resultSummary && (
            <Alert
              type={resultDetails.length > 0 ? "warning" : "success"}
              showIcon
              closable
              message="Attendance save complete"
              description={
                <div>
                  <div>{resultSummary.text}</div>
                  {resultDetails.length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                      {resultDetails.map((result, index) => {
                        const row = rosterById.get(result.studentId);
                        const stored = result.stored;
                        const storedNote = cleanNote(stored?.note);
                        return (
                          <li key={`${result.studentId}-${index}`}>
                            <Text strong>
                              {row ? studentName(row) : result.studentId}
                            </Text>
                            {": "}
                            {result.action === "conflict"
                              ? "changed elsewhere"
                              : "rejected"}
                            {stored
                              ? ` — server value is ${STATUS_LABELS[stored.status]}${storedNote ? ` (${storedNote})` : ""}`
                              : ""}
                            {result.reason ? ` — ${result.reason}` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              }
              onClose={() => setSaveResults(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          <Card
            title={
              <Space wrap>
                <span>
                  {selectedSection?.name
                    ? `${selectedSection.name} roster`
                    : "Roster"}
                </span>
                <Text type="secondary">
                  {markedCount} of {roster.length} marked
                </Text>
                {rosterFetching && <Text type="secondary">Refreshing…</Text>}
              </Space>
            }
            extra={
              <Space wrap>
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={handleMarkAllPresent}
                  disabled={roster.length === 0 || isSaving}
                >
                  Mark all present
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={isSaving}
                  disabled={changedRecords.length === 0}
                  onClick={() => void handleSave()}
                >
                  Save attendance
                  {changedRecords.length > 0
                    ? ` (${changedRecords.length})`
                    : ""}
                </Button>
              </Space>
            }
          >
            {rosterLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : rosterError && roster.length === 0 ? (
              <Alert
                type="error"
                showIcon
                message="Could not load the roster"
                description={extractApiErrorMessage(rosterError)}
                action={
                  <Button size="small" onClick={() => void refetchRoster()}>
                    Retry
                  </Button>
                }
              />
            ) : (
              <Table<AttendanceRosterRow>
                columns={columns}
                dataSource={roster}
                rowKey="studentId"
                pagination={false}
                scroll={{ x: 880 }}
                locale={{
                  emptyText: "No students are enrolled in this section.",
                }}
              />
            )}
          </Card>
        </>
      )}
    </>
  );
}
