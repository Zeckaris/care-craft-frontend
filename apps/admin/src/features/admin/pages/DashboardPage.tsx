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

export const DashboardPage = () => {
  const {
    totalStudents,
    totalTeachers,
    genderBreakdown,
    totalInGenderChart,
    recentActivities,
  } = useDashboardStats();

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
