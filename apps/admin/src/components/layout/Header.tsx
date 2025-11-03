import { Avatar, Dropdown, Input, Menu, Space, Tooltip } from "antd";
import { UserOutlined, SettingOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

interface HeaderProps {
  collapsed?: boolean;
}

const Header = ({ collapsed }: HeaderProps) => {
  const navigate = useNavigate();

  const userMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "profile") navigate("/admin/profile");
        if (key === "logout") {
          console.log("Logout");
        }
      }}
    >
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="logout" danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="admin-header">
      {/* === LEFT: SEARCH BAR === */}
      <div className="header-search">
        <Search
          placeholder="Search students, teachers, subjects..."
          allowClear
          enterButton
          size="middle"
          className="search-input"
        />
      </div>

      {/* === RIGHT: ICONS + AVATAR === */}
      <Space size="middle" className="header-actions">
        <Tooltip title="Notifications">
          <BellOutlined className="header-icon" />
        </Tooltip>

        <Tooltip title="Settings">
          <SettingOutlined
            className="header-icon"
            onClick={() => navigate("/admin/settings")}
          />
        </Tooltip>

        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            size="large"
            icon={<UserOutlined />}
            className="header-avatar"
          />
        </Dropdown>
      </Space>
    </header>
  );
};

export default Header;
