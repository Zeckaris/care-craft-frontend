import { Breadcrumb } from "@/components/common/Breadcrumb";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GenderDonut } from "@/components/dashboard/GenderDonut";
import { GradeTrendChart } from "@/components/dashboard/GradeTrendChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickLinkButton } from "@/components/dashboard/QuickLinkButton";
import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUser } from "@/context/UserContext";

export const DashboardPage = () => {
  const { user } = useUser();

  // ALWAYS call hooks (Rules of Hooks)
  const stats = useDashboardStats();

  // Provide safe default values
  const totalStudents = user ? (stats.totalStudents ?? 0) : 0;
  const totalTeachers = user ? (stats.totalTeachers ?? 0) : 0;
  const genderBreakdown = user ? (stats.genderBreakdown ?? []) : [];
  const totalInGenderChart = user ? (stats.totalInGenderChart ?? 0) : 0;
  const recentActivities = user ? (stats.recentActivities ?? []) : [];

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
        <div className="dashboard-grid">
          {/* === Metric Cards === */}
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

          <div className="chart-card full-width">
            <GenderDonut data={genderBreakdown} total={totalInGenderChart} />
          </div>

          <div className="qlink-feed-container">
            <div className="feed-card">
              <ActivityFeed activities={recentActivities} />
            </div>

            <div className="quick-links">
              <QuickLinkButton
                to="/admin/students"
                icon={<UserAddOutlined />}
                label="Manage Students"
              />
              <QuickLinkButton
                to="/admin/grades"
                icon={<TrophyOutlined />}
                label="Assign Grades"
              />
              <QuickLinkButton
                to="/admin/attendance"
                icon={<CalendarOutlined />}
                label="Take Attendance"
              />
            </div>
          </div>

          <div className="chart-full full-width">
            <GradeTrendChart />
          </div>
        </div>
      </main>
    </div>
  );
};
