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
  AppstoreOutlined,
  RadarChartOutlined,
  StrikethroughOutlined,
  BarsOutlined,
  FieldTimeOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { RiMedal2Line } from "react-icons/ri";
import { EyeOutlined } from "@ant-design/icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SidebarProps {
  collapsed: boolean;
}

interface SidebarMenuItemType {
  key: string;
  icon: ReactNode;
  label: ReactNode;
  roles?: string[];
  children?: { key: string; label: ReactNode; roles?: string[] }[];
}

const menuItems: SidebarMenuItemType[] = [
  { key: "/app/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/app/students", icon: <UserOutlined />, label: "Students" },
  {
    key: "/app/attendance",
    icon: <CheckSquareOutlined />,
    label: "Attendance",
  },
  {
    key: "/app/enroll",
    icon: <CalendarOutlined />,
    label: "Enroll",
  },
  { key: "/app/teachers", icon: <TeamOutlined />, label: "Teachers" },
  { key: "/app/subjects", icon: <BookOutlined />, label: "Subjects" },
  { key: "/app/grades", icon: <TrophyOutlined />, label: "Grades" },
  { key: "/app/sections", icon: <BarsOutlined />, label: "Sections" },
  {
    key: "/app/schedule",
    icon: <FieldTimeOutlined />,
    label: "Schedule",
    roles: ["admin", "coordinator"],
  },
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
      {
        key: "/app/assessments/results",
        label: <Link to="/app/assessments/results">Results</Link>,
        roles: ["admin", "coordinator"],
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
  const { user } = useCurrentUser();

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

  const canSeeItem = (roles?: string[]) =>
    !roles || (!!user && roles.includes(user.role));

  const items = menuItems
    .filter((item) => canSeeItem(item.roles))
    .map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children
            .filter((child) => canSeeItem(child.roles))
            .map((child) => ({
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
