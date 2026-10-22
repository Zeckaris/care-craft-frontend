import { Breadcrumb } from "@/components/common/Breadcrumb";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GenderDonut } from "@/components/dashboard/GenderDonut";
import { GradeTrendChart } from "@/components/dashboard/GradeTrendChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickLinkButton } from "@/components/dashboard/QuickLinkButton";
import { AttendanceSnapshotCard } from "@/components/dashboard/AttendanceSnapshotCard";
import { ClassPerformanceCard } from "@/components/dashboard/ClassPerformanceCard";
import { AttendanceComplianceCard } from "@/components/dashboard/AttendanceComplianceCard";
import { ChronicAbsenteesCard } from "@/components/dashboard/ChronicAbsenteesCard";
import { SectionsNeedingSupportCard } from "@/components/dashboard/SectionsNeedingSupportCard";
import { SubjectsNeedingSupportCard } from "@/components/dashboard/SubjectsNeedingSupportCard";
import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAttendanceSnapshot } from "@/hooks/useAttendanceSnapshot";
import { useClassPerformance } from "@/hooks/useClassPerformance";
import { useAttendanceCompliance } from "@/hooks/useAttendanceCompliance";
import { useChronicAbsentees } from "@/hooks/useChronicAbsentees";
import { usePerformanceAlerts } from "@/hooks/usePerformanceAlerts";
import { useUser } from "@/context/UserContext";

export const DashboardPage = () => {
  const { user } = useUser();

  // ALWAYS call hooks (Rules of Hooks)
  const stats = useDashboardStats({ enabled: !!user });
  const attendance = useAttendanceSnapshot({ enabled: !!user });
  const classPerformance = useClassPerformance({ enabled: !!user });
  const compliance = useAttendanceCompliance({ enabled: !!user });
  const absentees = useChronicAbsentees({ enabled: !!user });
  const performanceAlerts = usePerformanceAlerts({ enabled: !!user });

  // Provide safe default values
  const totalStudents = user ? (stats.totalStudents ?? 0) : 0;
  const totalTeachers = user ? (stats.totalTeachers ?? 0) : 0;
  const genderBreakdown = user ? (stats.genderBreakdown ?? []) : [];
  const totalInGenderChart = user ? (stats.totalInGenderChart ?? 0) : 0;
  const recentActivities = user ? (stats.recentActivities ?? []) : [];
  const enrollmentTrend = user ? stats.enrollmentTrend : null;

  // Render a message if the user is not signed in
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Welcome!</h2>
        <p>
          Please <a href="/signin">login</a> to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Breadcrumb />
      </header>

      <main className="dashboard-content">
        <div className="dashboard-rows">
          {/* === Row 1: Metrics === */}
          <div className="dashboard-row row-metrics">
            <MetricCard
              title="Total Students"
              value={totalStudents}
              icon={<UserOutlined />}
            />
            <MetricCard
              title="Total Teachers"
              value={totalTeachers}
              icon={<TeamOutlined />}
            />
          </div>

          {/* === Row 2: Actionable Attention Items (2x2 Grid) === */}
          <div className="dashboard-row row-attention">
            <AttendanceComplianceCard
              data={compliance.data}
              isLoading={compliance.isLoading}
              isError={compliance.isError}
              onRetry={compliance.refetch}
            />
            <ChronicAbsenteesCard
              data={absentees.data}
              isLoading={absentees.isLoading}
              isError={absentees.isError}
              onRetry={absentees.refetch}
            />
            <SectionsNeedingSupportCard
              data={performanceAlerts.data}
              isLoading={performanceAlerts.isLoading}
              isError={performanceAlerts.isError}
              onRetry={performanceAlerts.refetch}
            />
            <SubjectsNeedingSupportCard
              data={performanceAlerts.data}
              isLoading={performanceAlerts.isLoading}
              isError={performanceAlerts.isError}
              onRetry={performanceAlerts.refetch}
            />
          </div>

          {/* === Row 3: Attendance snapshot + Class performance === */}
          <div className="dashboard-row row-highlights">
            <AttendanceSnapshotCard
              snapshot={attendance.snapshot}
              isLoading={attendance.isLoading}
              isError={attendance.isError}
              onRetry={attendance.refetch}
            />
            <ClassPerformanceCard
              performance={classPerformance.performance}
              isLoading={classPerformance.isLoading}
              isError={classPerformance.isError}
              onRetry={classPerformance.refetch}
            />
          </div>

          {/* === Row 3: Gender donut + quick links / Recent activity === */}
          <div className="dashboard-row row-activity">
            <div className="activity-left">
              <GenderDonut data={genderBreakdown} total={totalInGenderChart} />

              <div className="quick-links">
                <QuickLinkButton
                  to="/app/sections"
                  icon={<UserAddOutlined />}
                  label="Manage Students"
                />
                <QuickLinkButton
                  to="/app/attendance"
                  icon={<CalendarOutlined />}
                  label="Take Attendance"
                />
              </div>
            </div>

            <div className="activity-feed-cell">
              <div className="feed-card">
                <ActivityFeed activities={recentActivities} />
              </div>
            </div>
          </div>

          {/* === Row 4: Enrollment trend === */}
          <div className="dashboard-row row-trend">
            <GradeTrendChart data={enrollmentTrend} />
          </div>
        </div>
      </main>
    </div>
  );
};
