import {
  Avatar,
  Badge,
  Dropdown,
  Input,
  Layout,
  Menu,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  CrownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useUser } from "@/context/UserContext";
import { useNotificationCounts } from "@/hooks/notifications/useNotificationCounts";

const { Search } = Input;
const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { user } = useUser();

  // New: Get unread count for badge
  const { unreadCount, isLoading } = useNotificationCounts();

  const avatarIcon =
    user?.role === "admin" ? <CrownOutlined /> : <TeamOutlined />;

  const userMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "profile") navigate("/admin/profile");
        if (key === "logout") logout();
      }}
    >
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="logout" danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="admin-header">
      {/* LEFT: Search */}
      <div className="header-search">
        <Search
          placeholder="Search students, teachers, subjects..."
          allowClear
          size="middle"
          enterButton
          onSearch={(value) => console.log("Search:", value)}
        />
      </div>

      {/* RIGHT: Icons + Avatar Dropdown */}
      <Space className="header-actions" size="middle">
        <Tooltip title="Notifications">
          <Badge count={isLoading ? 0 : unreadCount} overflowCount={99}>
            <BellOutlined
              className="anticon"
              onClick={() => navigate("/notifications")}
              style={{ cursor: "pointer" }}
            />
          </Badge>
        </Tooltip>

        <Tooltip title="Settings">
          <SettingOutlined
            className="anticon"
            onClick={() => navigate("/settings")}
          />
        </Tooltip>

        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space align="center" size={8} style={{ cursor: "pointer" }}>
            <Avatar size={36} icon={avatarIcon} className="ant-avatar" />
            <Text
              strong
              className="header-username"
              style={{
                fontSize: "var(--font-medium)",
                color: "var(--white)",
              }}
            >
              {user?.firstName || "Guest"}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
