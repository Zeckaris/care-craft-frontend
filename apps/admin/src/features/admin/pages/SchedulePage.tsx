import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Input,
  Result,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from "antd";
import { ScheduleOutlined } from "@ant-design/icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import { ScheduleSettingsPanel } from "@/components/schedule/ScheduleSettingsPanel";
import { WeeklyPeriodsPanel } from "@/components/schedule/WeeklyPeriodsPanel";
import { ReadinessPanel } from "@/components/schedule/ReadinessPanel";
import { TimetablePanel } from "@/components/schedule/TimetablePanel";

const { Text, Title } = Typography;

const YEAR_RE = /^\d{4}-\d{4}$/;
const ALLOWED_ROLES = ["admin", "coordinator"];

export default function SchedulePage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { currentCalendar } = useAcademicCalendars();

  const [yearInput, setYearInput] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [activeTab, setActiveTab] = useState("settings");

  // Default to the current academic calendar's year (editable).
  useEffect(() => {
    if (currentCalendar?.academicYear) {
      setYearInput((prev) => prev || currentCalendar.academicYear);
      setSchoolYear((prev) => prev || currentCalendar.academicYear);
    }
  }, [currentCalendar]);

  const commitYear = (value: string) => {
    setYearInput(value);
    if (YEAR_RE.test(value)) {
      setSchoolYear(value);
    }
  };

  if (userLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You do not have access to the class schedule."
      />
    );
  }

  const yearValid = YEAR_RE.test(yearInput);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <ScheduleOutlined /> Schedule
        </Title>
        <Text type="secondary">
          Configure the bell schedule and weekly periods, then check readiness
          before a schedule is generated.
        </Text>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap align="center">
          <Text strong>School Year</Text>
          <Input
            placeholder="e.g. 2024-2025"
            value={yearInput}
            onChange={(e) => commitYear(e.target.value.trim())}
            style={{ width: 180 }}
            status={yearInput && !yearValid ? "error" : undefined}
          />
          <Text type="secondary">
            Use the YYYY-YYYY format. Defaults to the current academic calendar.
          </Text>
        </Space>
      </Card>

      {!schoolYear ? (
        <Alert
          type="info"
          showIcon
          message="Select a school year"
          description="Enter a school year in YYYY-YYYY format to manage the schedule."
        />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "settings",
              label: "Settings",
              children: <ScheduleSettingsPanel schoolYear={schoolYear} />,
            },
            {
              key: "weekly",
              label: "Weekly Periods",
              children: (
                <WeeklyPeriodsPanel
                  schoolYear={schoolYear}
                  onGoToSettings={() => setActiveTab("settings")}
                />
              ),
            },
            {
              key: "readiness",
              label: "Readiness",
              children: <ReadinessPanel schoolYear={schoolYear} />,
            },
            {
              key: "timetable",
              label: "Timetable",
              children: (
                <TimetablePanel
                  schoolYear={schoolYear}
                  active={activeTab === "timetable"}
                  onGoToReadiness={() => setActiveTab("readiness")}
                />
              ),
            },
          ]}
        />
      )}
    </>
  );
}
