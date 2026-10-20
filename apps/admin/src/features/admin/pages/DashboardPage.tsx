import { Breadcrumb } from "@/components/common/Breadcrumb";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GenderDonut } from "@/components/dashboard/GenderDonut";
import { GradeTrendChart } from "@/components/dashboard/GradeTrendChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickLinkButton } from "@/components/dashboard/QuickLinkButton";
import { AttendanceSnapshotCard } from "@/components/dashboard/AttendanceSnapshotCard";
import { ClassPerformanceCard } from "@/components/dashboard/ClassPerformanceCard";
import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAttendanceSnapshot } from "@/hooks/useAttendanceSnapshot";
import { useClassPerformance } from "@/hooks/useClassPerformance";
import { useUser } from "@/context/UserContext";

export const DashboardPage = () => {
  const { user } = useUser();

  // ALWAYS call hooks (Rules of Hooks)
  const stats = useDashboardStats({ enabled: !!user });
  const attendance = useAttendanceSnapshot({ enabled: !!user });
  const classPerformance = useClassPerformance({ enabled: !!user });

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

          {/* === Row 2: Attendance + Class performance === */}
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
