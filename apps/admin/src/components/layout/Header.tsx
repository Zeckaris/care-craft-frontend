import { Avatar, Dropdown, Input, Layout, Menu, Space, Tooltip } from "antd";
import { UserOutlined, SettingOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

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

        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar className="ant-avatar" icon={<UserOutlined />} />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
