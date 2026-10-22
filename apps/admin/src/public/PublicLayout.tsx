import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Layout, Button, Drawer, Space, Typography } from "antd";
import {
  MenuOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "@/public/styles/public.css";

const { Header, Content, Footer } = Layout;
const { Paragraph } = Typography;

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore Features", path: "/features" },
    { label: "About Us", path: "/about" },
  ];

  return (
    <Layout
      className="public-layout"
      style={{ minHeight: "100vh", background: "#ffffff" }}
    >
      {/* HEADER NAVBAR */}
      <Header
        className={`public-header ${scrolled ? "header-scrolled" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "0 40px" : "0 60px",
          height: scrolled ? "70px" : "85px",
          background: scrolled ? "rgba(255, 255, 255, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(124, 36, 75, 0.08)" : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="header-logo-container">
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              src="/images/logo.png"
              alt="CareCraft Logo"
              style={{
                height: scrolled ? "40px" : "48px",
                transition: "all 0.3s ease",
              }}
            />
            <span
              className="logo-text"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: scrolled ? "22px" : "26px",
                color: "#7c244b",
                letterSpacing: "-0.5px",
                transition: "all 0.3s ease",
              }}
            >
              CareCraft
            </span>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: "32px" }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "public-nav-link-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP CTA BUTTONS */}
        <div
          className="desktop-actions"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <Link to="/signin">
            <Button
              type="text"
              style={{
                color: "#7c244b",
                fontWeight: 600,
                fontSize: "15px",
                height: "40px",
                padding: "0 20px",
              }}
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signin">
            <Button
              className="cc-btn-gold"
              style={{
                height: "44px",
                borderRadius: "22px",
                padding: "0 24px",
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Try Demo
            </Button>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: "22px", color: "#7c244b" }} />}
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          style={{ display: "none" }}
        />
      </Header>

      {/* MOBILE DRAWER */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/images/logo.png"
              alt="CareCraft Logo"
              style={{ height: "32px" }}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                color: "#7c244b",
                fontSize: "20px",
              }}
            >
              CareCraft
            </span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        extra={null}
        styles={{
          header: {
            borderBottom: "1px solid rgba(124, 36, 75, 0.08)",
            padding: "20px 24px",
          },
          body: {
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            gap: "24px",
          },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "auto",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            paddingTop: "24px",
          }}
        >
          <Link to="/signin" style={{ width: "100%" }}>
            <Button
              block
              style={{
                height: "44px",
                borderColor: "#7c244b",
                color: "#7c244b",
                fontWeight: 600,
                borderRadius: "22px",
              }}
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signin" style={{ width: "100%" }}>
            <Button
              block
              className="cc-btn-gold"
              style={{ height: "44px", borderRadius: "22px" }}
            >
              Try Demo
            </Button>
          </Link>
        </div>
      </Drawer>

      {/* PAGE CONTENT */}
      <Content
        className="public-content"
        style={{ minHeight: "calc(100vh - 85px)" }}
      >
        <Outlet />
      </Content>

      {/* FOOTER */}
      <Footer className="public-footer">
        <div
          className="footer-container"
          style={{ maxWidth: "1300px", margin: "0 auto" }}
        >
          <div
            className="footer-top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div
              className="footer-brand"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <img
                src="/images/logo.png"
                alt="CareCraft Logo"
                style={{ height: "36px" }}
              />
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#ffffff",
                }}
              >
                CareCraft
              </span>
            </div>

            <Space size="large" className="footer-socials">
              <a
                href="https://x.com/amanuelzcoder"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://www.linkedin.com/in/amanfisseha/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinOutlined />
              </a>
              <a
                href="https://github.com/Zeckaris"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubOutlined />
              </a>
              <a
                href="https://t.me/amanfisseha"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <SendOutlined />
              </a>
            </Space>
          </div>

          <div
            className="footer-divider"
            style={{
              height: "1px",
              background: "rgba(255, 255, 255, 0.1)",
              marginBottom: "24px",
            }}
          />

          <Paragraph
            className="footer-copyright"
            style={{
              margin: 0,
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} CareCraft • Built with care in Addis
            Ababa for Ethiopian schools.
          </Paragraph>
        </div>
      </Footer>
    </Layout>
  );
}
