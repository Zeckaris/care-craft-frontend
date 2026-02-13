import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Header, Content, Footer } = Layout;

export function PublicLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", padding: "0 50px" }}>
        {/* Logo + nav links: Home, Features, About, Sign In */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src="/carecraft-high-resolution-logo.png"
            alt="CareCraft"
            height={40}
          />
          <div>
            <a href="/features">Features</a> | <a href="/about">About</a> |{" "}
            <a href="/signin">Sign In</a>
          </div>
        </div>
      </Header>
      <Content style={{ padding: "50px", background: "#f0f2f5" }}>
        <Outlet /> {/* page content here */}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        CareCraft © {new Date().getFullYear()} - Empowering schools in Ethiopia
      </Footer>
    </Layout>
  );
}
