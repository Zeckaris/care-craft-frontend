import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
  BankOutlined,
  HeartFilled,
  SafetyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface SidebarProps {
  collapsed: boolean;
}

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/students", icon: <UserOutlined />, label: "Students" },
  {
    key: "/enroll",
    icon: <CalendarOutlined />,
    label: "Enroll",
  },
  { key: "/teachers", icon: <TeamOutlined />, label: "Teachers" },
  { key: "/subjects", icon: <BookOutlined />, label: "Subjects" },
  { key: "/grades", icon: <TrophyOutlined />, label: "Grades" },
  { key: "/parents", icon: <HeartFilled />, label: "Parents" },
  { key: "/school-info", icon: <BankOutlined />, label: "School Info" },
  {
    key: "/coordinators",
    icon: <UserSwitchOutlined />,
    label: "Coordinators",
  },
  {
    key: "/assessments",
    icon: <SafetyOutlined />,
    label: "Assessments",
    children: [
      {
        key: "/assessments/types",
        label: <Link to="/assessments/types">Types</Link>,
      },
      {
        key: "/assessments/setup",
        label: <Link to="/assessments/setup">Setup</Link>,
      },
    ],
  },
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const selectedKey = location.pathname;

  // === CONTROLLED openKeys ===
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Auto-open if on child route
  useEffect(() => {
    if (location.pathname.startsWith("/assessments")) {
      setOpenKeys(["/assessments"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey && latestOpenKey === "/assessments") {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys([]);
    }
  };

  const items = menuItems.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children.map((child) => ({
          key: child.key,
          label: child.label, // Already has <Link>
        })),
      };
    }
    return {
      key: item.key,
      icon: item.icon,
      label: <Link to={item.key}>{item.label}</Link>,
    };
  });

  return (
    <>
      <div className="sidebar-logo">{collapsed ? "CC" : "Care Craft"}</div>

      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
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
