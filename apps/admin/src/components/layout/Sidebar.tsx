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
  ScheduleOutlined,
  ReconciliationOutlined,
  AppstoreOutlined,
  RadarChartOutlined,
  StrikethroughOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdPlaylistAddCheck } from "react-icons/md";
import { RiMedal2Line } from "react-icons/ri";
import { EyeOutlined } from "@ant-design/icons";

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
  {
    key: "/calendar",
    icon: <ScheduleOutlined />,
    label: "Academic Calendar",
  },
  {
    key: "/gsa",
    icon: <AppstoreOutlined />,
    label: "Grade Subject Assessment Setup",
  },
  {
    key: "/attribute-categories",
    icon: <RadarChartOutlined />,
    label: "Attribute Categories",
  },
  {
    key: "/attribute-evaluations",
    icon: <StrikethroughOutlined />,
    label: "Attribute Evaluation",
  },
  {
    key: "/action-plans",
    icon: <MdPlaylistAddCheck style={{ fontSize: 18 }} />,
    label: "Action Plans",
  },
  {
    key: "/badges",
    icon: <RiMedal2Line style={{ fontSize: 18 }} />,
    label: "Badges",
    children: [
      {
        key: "/badges/definitions",
        label: <Link to="/badges/definitions">Definitions</Link>,
      },
      {
        key: "/badges/criteria",
        label: <Link to="/badges/criteria">Criteria</Link>,
      },
      {
        key: "/badges/awards",
        label: <Link to="/badges/awards">Awards</Link>,
      },
    ],
  },
  {
    key: "/observations",
    icon: <EyeOutlined />,
    label: "Observations",
  },
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const selectedKey = location.pathname;

  // === CONTROLLED openKeys ===
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Auto-open parent if currently on a child route
  useEffect(() => {
    if (location.pathname.startsWith("/assessments")) {
      setOpenKeys(["/assessments"]);
    } else if (location.pathname.startsWith("/badges")) {
      setOpenKeys(["/badges"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  // Allow only one submenu open at a time
  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));

    if (
      latestOpenKey &&
      (latestOpenKey === "/assessments" || latestOpenKey === "/badges")
    ) {
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
