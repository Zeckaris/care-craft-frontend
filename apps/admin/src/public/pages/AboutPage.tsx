import { Helmet } from "@dr.pogodin/react-helmet";
import { Typography, Row, Col, Space, Button } from "antd";
import { Link } from "react-router-dom";
import "@/public/styles/public.css";

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Amanuel & CareCraft</title>
        <meta
          name="description"
          content="Meet Amanuel, the developer behind CareCraft, a complete school management system built to nurture every aspect of a child's growth in Ethiopian schools."
        />
      </Helmet>

      {/* HERO SECTION */}
      <section
        style={{
          padding: "100px 40px",
          background: "linear-gradient(135deg, #7c244b 0%, #4a0d25 100%)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="container">
          <Row align="middle" gutter={[48, 48]}>
            <Col xs={24} md={6} style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: "190px",
                  height: "190px",
                  borderRadius: "50%",
                  padding: "6px",
                  background: "linear-gradient(135deg, #e6af2e 0%, #7c244b 100%)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src="/images/amanuel-profile.jpg"
                  alt="Amanuel"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "top",
                    border: "4px solid #ffffff",
                  }}
                />
              </div>
            </Col>

            <Col xs={24} md={18}>
              <Title
                style={{
                  color: "#ffffff",
                  fontSize: "48px",
                  fontWeight: 800,
                  margin: "0 0 16px 0",
                  letterSpacing: "-1px",
                }}
              >
                About Me & CareCraft
              </Title>
              <Paragraph
                style={{
                  fontSize: "22px",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: "1.6",
                  margin: 0,
                  maxWidth: "800px",
                }}
              >
                Hi, I'm Amanuel, a software engineer and agentic AI developer from Addis Ababa, Ethiopia.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* STORY SECTION */}
      <section style={{ background: "#ffffff", padding: "100px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          
          <Title
            level={2}
            className="section-title"
            style={{ marginBottom: "50px", color: "#2081c3" }}
          >
            My Story Behind CareCraft
          </Title>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Paragraph
              style={{
                fontSize: "18px",
                lineHeight: "1.8",
                color: "var(--text-main)",
                margin: 0,
              }}
            >
              This idea has been in my mind for a long time. I kept noticing that most school management platforms are built mainly to automate traditional tasks: registrations, announcements, attaching assignments, sending notices, basically replacing manual paperwork with digital versions and stopping there.
            </Paragraph>

            <Paragraph
              style={{
                fontSize: "18px",
                lineHeight: "1.8",
                color: "var(--text-main)",
                margin: 0,
              }}
            >
              But I believe technology in education should do much more. It should primarily focus on nurturing students, helping them grow not just in academics, but in every aspect of life. That's why I created CareCraft: a complete school management system that also tracks and supports children's social skills, soft skills, confidence, emotional well-being, and more, things that matter just as much as grades.
            </Paragraph>

            <div
              style={{
                marginTop: "30px",
                padding: "36px",
                background: "linear-gradient(145deg, #fef4f8 0%, #fff0f5 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(124, 36, 75, 0.06)",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(124, 36, 75, 0.02)",
              }}
            >
              <Paragraph
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "20px",
                  lineHeight: "1.8",
                  color: "#7c244b",
                  fontStyle: "italic",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                CareCraft is my way of combining technology with care, not just to manage schools but to truly help children become their best selves.
              </Paragraph>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <Title level={2}>Want to See It in Action?</Title>
          <Space size="large" wrap style={{ marginTop: "24px" }}>
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
              <Button size="large" className="cc-btn-white-outline">
                Back to Home
              </Button>
            </Link>
          </Space>
        </div>
      </section>
    </>
  );
}
