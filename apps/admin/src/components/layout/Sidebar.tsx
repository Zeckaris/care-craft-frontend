import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  FallOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

const menuItems = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/students", icon: <UserOutlined />, label: "Students" },
  { key: "/admin/teachers", icon: <TeamOutlined />, label: "Teachers" },
  { key: "/admin/subjects", icon: <BookOutlined />, label: "Subjects" },
  { key: "/admin/grades", icon: <TrophyOutlined />, label: "Grades" },
  { key: "/admin/parents", icon: <FallOutlined />, label: "Parents" },
  {
    key: "/admin/coordinators",
    icon: <UserSwitchOutlined />,
    label: "Coordinators",
  },
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const selectedKey = location.pathname;

  const items = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: <Link to={item.key}>{item.label}</Link>,
  }));

  return (
    <>
      {/* === LOGO === */}
      <div className="sidebar-logo">{collapsed ? "CC" : "Care Craft"}</div>

      {/* === MENU — SCROLLABLE === */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        items={items}
        className="sidebar-menu"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          borderRight: 0,
        }}
      />
    </>
  );
};

export default Sidebar;
