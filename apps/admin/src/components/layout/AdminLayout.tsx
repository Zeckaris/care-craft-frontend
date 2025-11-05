import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Sider, Content } = Layout;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="admin-layout" style={{ minHeight: "100vh" }}>
      {/* === SIDEBAR === */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={80}
        className="admin-sidebar"
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* === MAIN AREA === */}
      <Layout
        className="main-layout"
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: "margin-left 0.2s",
        }}
      >
        <Header />

        <Content className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
