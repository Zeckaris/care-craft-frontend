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
  { key: "/app/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/app/students", icon: <UserOutlined />, label: "Students" },
  {
    key: "/app/enroll",
    icon: <CalendarOutlined />,
    label: "Enroll",
  },
  { key: "/app/teachers", icon: <TeamOutlined />, label: "Teachers" },
  { key: "/app/subjects", icon: <BookOutlined />, label: "Subjects" },
  { key: "/app/grades", icon: <TrophyOutlined />, label: "Grades" },
  { key: "/app/parents", icon: <HeartFilled />, label: "Parents" },
  { key: "/app/school-info", icon: <BankOutlined />, label: "School Info" },
  {
    key: "/app/coordinators",
    icon: <UserSwitchOutlined />,
    label: "Coordinators",
  },
  {
    key: "/app/assessments",
    icon: <SafetyOutlined />,
    label: "Assessments",
    children: [
      {
        key: "/app/assessments/types",
        label: <Link to="/app/assessments/types">Types</Link>,
      },
      {
        key: "/app/assessments/setup",
        label: <Link to="/app/assessments/setup">Setup</Link>,
      },
    ],
  },
  {
    key: "/app/calendar",
    icon: <ScheduleOutlined />,
    label: "Academic Calendar",
  },
  {
    key: "/app/gsa",
    icon: <AppstoreOutlined />,
    label: "Grade Subject Assessment Setup",
  },
  {
    key: "/app/attribute-categories",
    icon: <RadarChartOutlined />,
    label: "Attribute Categories",
  },
  {
    key: "/app/attribute-evaluations",
    icon: <StrikethroughOutlined />,
    label: "Attribute Evaluation",
  },
  {
    key: "/app/action-plans",
    icon: <MdPlaylistAddCheck style={{ fontSize: 18 }} />,
    label: "Action Plans",
  },
  {
    key: "/app/badges",
    icon: <RiMedal2Line style={{ fontSize: 18 }} />,
    label: "Badges",
    children: [
      {
        key: "/app/badges/definitions",
        label: <Link to="/app/badges/definitions">Definitions</Link>,
      },
      {
        key: "/app/badges/criteria",
        label: <Link to="/app/badges/criteria">Criteria</Link>,
      },
      {
        key: "/app/badges/awards",
        label: <Link to="/app/badges/awards">Awards</Link>,
      },
    ],
  },
  {
    key: "/app/observations",
    icon: <EyeOutlined />,
    label: "Observations",
  },
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const selectedKey = location.pathname;

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (location.pathname.startsWith("/app/assessments")) {
      setOpenKeys(["/app/assessments"]);
    } else if (location.pathname.startsWith("/app/badges")) {
      setOpenKeys(["/app/badges"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));

    if (
      latestOpenKey &&
      (latestOpenKey === "/app/assessments" || latestOpenKey === "/app/badges")
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
