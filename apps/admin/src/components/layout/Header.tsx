import {
  Avatar,
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
import { getUser } from "@/utils/auth";
import { PalettePicker } from "@/components/common/PalettePicker";

const { Search } = Input;
const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();

  const user = getUser();
  const avatarIcon =
    user?.role === "admin" ? <CrownOutlined /> : <TeamOutlined />;

  const userMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "profile") navigate("/admin/profile");
        if (key === "logout") console.log("Logout");
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
          <BellOutlined className="anticon" />
        </Tooltip>

        <Tooltip title="Settings">
          <SettingOutlined
            className="anticon"
            onClick={() => navigate("/admin/settings")}
          />
        </Tooltip>
        <PalettePicker />

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
