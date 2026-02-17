import { Helmet } from "@dr.pogodin/react-helmet";
import { Typography, Row, Col, Space, Button } from "antd";
import { Link } from "react-router-dom";
import "@/public/styles/public.css";
import {
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Amanuel & CareCraft</title>
        <meta
          name="description"
          content="Meet Amanuel, the developer behind CareCraft a platform built to nurture every aspect of a child's growth in Ethiopian schools."
        />
      </Helmet>

      <section
        style={{
          padding: "80px 40px",
          background: "linear-gradient(135deg, #f9f4f7 0%, #fff0f5 100%)",
          minHeight: "auto",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row justify="start" align="top" gutter={[48, 48]}>
            <Col xs={24} md={6} style={{ textAlign: "center" }}>
              <img
                src="/images/amanuel-profile.jpg"
                alt="Amanuel"
                style={{
                  width: "100%",
                  maxWidth: "150px",
                  borderRadius: "50%",

                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </Col>

            <Col xs={24} md={18}>
              <Title
                style={{
                  marginBottom: "16px",
                  textAlign: "left",
                  fontSize: "42px",
                  color: "#7c244b",
                }}
              >
                About Me & CareCraft
              </Title>
              <Paragraph
                style={{
                  fontSize: "20px",
                  maxWidth: "700px",
                  textAlign: "left",
                  color: "#333",
                }}
              >
                Hi, I'm Amanuel, a full-stack developer and AI enthusiast from
                Addis Ababa, Ethiopia.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      <section
        style={{
          padding: "60px 40px",
          background: "#ffffff",
          boxShadow: "inset 0 0 20px rgba(124, 36, 75, 0.05)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "48px",
              color: "#2081c3",
            }}
          >
            My Story Behind CareCraft
          </Title>

          <Paragraph
            style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "32px" }}
          >
            This idea has been in my mind for a long time. I kept noticing that
            most school management platforms are built mainly to automate
            traditional tasks: registrations, announcements, attaching
            assignments, sending notices, basically replacing manual paperwork
            with digital versions.
          </Paragraph>

          <Paragraph
            style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "32px" }}
          >
            But I believe technology in education should do much more. It should
            primarily focus on nurturing students, helping them grow not just in
            academics, but in every aspect of life. That's why I created
            CareCraft: a platform that tracks and supports children's social
            skills, soft skills, confidence, emotional well-being, and more,
            things that matter just as much as grades.
          </Paragraph>

          <Paragraph
            style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "32px" }}
          >
            In our Ethiopian culture, respect and consciousness are deeply
            rooted values and I truly value that. At the same time, I’ve seen
            how these beautiful qualities can sometimes make children more
            timid, less confident in speaking up, or slower to develop certain
            social skills compared to some other environments. That observation
            became one of my strongest motivations: to help nurture these skills
            from early childhood, gently and genuinely, so every child can grow
            with balance and strength.
          </Paragraph>

          <Paragraph
            style={{
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "32px",
              textAlign: "center",
              fontStyle: "italic",
              color: "#7c244b",
            }}
          >
            CareCraft is my way of combining technology with care, not just to
            manage schools but to truly help children become their best selves.
          </Paragraph>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <Title level={2}>Want to See It in Action?</Title>
        <Space size="large" wrap>
          <Link to="/signin">
            <Button size="large" className="cc-btn-gold">
              Try Demo Account
            </Button>
          </Link>
          <Link to="/features">
            <Button size="large" className="cc-btn-blue">
              Explore Features
            </Button>
          </Link>
          <Link to="/">
            <Button size="large" className="cc-btn-blue">
              Back to Home
            </Button>
          </Link>
        </Space>
      </section>

      {/* FOOTER */}
      <footer className="public-footer">
        <Space size="large">
          <a
            href="https://x.com/amanuelzcoder"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterOutlined />
          </a>
          <a
            href="https://www.linkedin.com/in/amanfisseha/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinOutlined />
          </a>
          <a
            href="https://github.com/Zeckaris"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubOutlined />
          </a>
          <a
            href="https://t.me/amanfisseha"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SendOutlined />
          </a>
        </Space>
        <Paragraph>
          © {new Date().getFullYear()} CareCraft • Built with care in Addis
          Ababa by Amanuel
        </Paragraph>
      </footer>
    </>
  );
}
