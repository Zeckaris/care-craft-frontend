import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Sider, Content } = Layout;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      const mobileBreakpoint = 768;
      const collapseBreakpoint = 992;
      const mobile = width <= mobileBreakpoint;
      setIsMobile(mobile);
      setCollapsed(width <= collapseBreakpoint);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <Layout className="admin-layout" style={{ minHeight: "100vh" }}>
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
          left: isMobile ? (mobileMenuOpen ? 0 : "-100%") : 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          transition: "left 0.3s ease",
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout
        className="main-layout"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 260,
          transition: "margin-left 0.2s",
        }}
        onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
      >
        <Header setMobileMenuOpen={setMobileMenuOpen} />

        <Content className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
