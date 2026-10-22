import { useEffect, useState } from "react";
import { Card, Empty, Select, Space, Tabs, Typography } from "antd";
import type { ISchedule, IScheduleEntry } from "@carecraft/types";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { useTeacherPicker } from "@/hooks/useTeacherPicker";
import { TimetableGrid } from "./TimetableGrid";
import { SchoolOverview } from "./SchoolOverview";
import { dayLabel } from "./scheduleUtils";

const { Text } = Typography;

interface ScheduleWorkspaceProps {
  schedule: ISchedule;
  entries: IScheduleEntry[];
}

type ViewKey = "section" | "teacher" | "overview";

export function ScheduleWorkspace({ schedule, entries }: ScheduleWorkspaceProps) {
  const { grades } = useGrades();
  const { teachers } = useTeacherPicker();

  const [view, setView] = useState<ViewKey>("section");
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);
  const [teacherId, setTeacherId] = useState<string | undefined>(undefined);

  const { sections } = useSections({
    schoolYear: schedule.schoolYear,
    gradeId,
    pageSize: 1000,
  });

  // Reset selections when a different schedule is opened.
  useEffect(() => {
    setView("section");
    setGradeId(undefined);
    setSectionId(undefined);
    setTeacherId(undefined);
  }, [schedule.scheduleId]);

  const sectionEntries = sectionId
    ? entries.filter((entry) => entry.sectionId === sectionId)
    : [];
  const teacherEntries = teacherId
    ? entries.filter((entry) => entry.teacherId === teacherId)
    : [];

  const gradeOptions = grades.map((g) => ({ label: g.level, value: g._id }));
  const sectionOptions = sections.map((s) => ({
    label: s.name,
    value: s._id,
  }));
  const teacherOptions = teachers.map((t) => ({
    label: `${t.firstName} ${t.lastName}`,
    value: t._id,
  }));

  const sectionView = (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap align="center">
        <Text strong>Grade</Text>
        <Select
          style={{ width: 180 }}
          placeholder="Select a grade"
          options={gradeOptions}
          value={gradeId}
          onChange={(value) => {
            setGradeId(value);
            setSectionId(undefined);
          }}
          showSearch
          optionFilterProp="label"
        />
        <Text strong>Section</Text>
        <Select
          style={{ width: 180 }}
          placeholder="Select a section"
          options={sectionOptions}
          value={sectionId}
          onChange={setSectionId}
          disabled={!gradeId}
          showSearch
          optionFilterProp="label"
        />
      </Space>

      {!sectionId ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Choose a grade and section to see its timetable."
        />
      ) : (
        <TimetableGrid
          schedule={schedule}
          entries={sectionEntries}
          variant="section"
        />
      )}
    </Space>
  );

  const teacherView = (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap align="center">
        <Text strong>Teacher</Text>
        <Select
          style={{ width: 240 }}
          placeholder="Select a teacher"
          options={teacherOptions}
          value={teacherId}
          onChange={setTeacherId}
          showSearch
          optionFilterProp="label"
        />
      </Space>

      {!teacherId ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Choose a teacher to see their timetable."
        />
      ) : (
        <TimetableGrid
          schedule={schedule}
          entries={teacherEntries}
          variant="teacher"
        />
      )}
    </Space>
  );

  const overviewView = (
    <SchoolOverview
      schedule={schedule}
      entries={entries}
      onOpenSection={(grade, section) => {
        setGradeId(grade);
        setSectionId(section);
        setView("section");
      }}
    />
  );

  const enabledDays = schedule.settingsSnapshot.enabledDays ?? [];
  const daySummary = enabledDays.map((day) => dayLabel(day)).join(", ");

  return (
    <Card
      size="small"
      title="Timetable views"
      extra={<Text type="secondary">Days: {daySummary || "-"}</Text>}
    >
      <Tabs
        activeKey={view}
        onChange={(key) => setView(key as ViewKey)}
        items={[
          { key: "section", label: "Section", children: sectionView },
          { key: "teacher", label: "Teacher", children: teacherView },
          { key: "overview", label: "School overview", children: overviewView },
        ]}
      />
    </Card>
  );
}
