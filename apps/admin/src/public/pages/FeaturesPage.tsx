import { Helmet } from "@dr.pogodin/react-helmet";
import {
  Typography,
  Row,
  Col,
  Card,
  Collapse,
  Button,
  Space,
  List,
} from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleOutlined,
  SettingOutlined,
  LineChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "@/public/styles/public.css";

const { Title, Paragraph } = Typography;

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>CareCraft Features - Parent Teacher Collaboration Tools</title>
        <meta
          name="description"
          content="Discover CareCraft's powerful features for schools, teachers, and parents. From student tracking to collaborative action plans."
        />
      </Helmet>

      {/* HERO */}
      <section className="landing-hero" style={{ padding: "80px 0 100px 0", textAlign: "center" }}>
        <div className="hero-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Title className="hero-title" style={{ fontSize: "52px", marginBottom: "20px" }}>
            CareCraft Features
          </Title>
          <Paragraph className="hero-description" style={{ fontSize: "19px", margin: "0 auto" }}>
            Explore our comprehensive tools designed to enhance parent-teacher collaboration and student development.
          </Paragraph>
        </div>
      </section>

      {/* FEATURES CONTENT */}
      <section className="landing-features" style={{ padding: "100px 40px" }}>
        <div className="container">
          
          {/* SCHOOL ADMINISTRATORS */}
          <div style={{ marginBottom: "80px" }}>
            <Title level={2} className="section-title">
              Tools for School Administrators
            </Title>
            <Paragraph className="section-subtitle">
              Manage operations, maintain absolute safety, and align resources to support classrooms.
            </Paragraph>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <SettingOutlined style={{ fontSize: "28px", color: "#7c244b" }} />
                    <Title level={4} style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                      Streamlined Setup and Management
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Easily assign teachers to students and classes for personalized support",
                      "Create and organize subjects with custom assessments to track progress",
                      "Securely onboard teachers and connect parents to their children",
                      "Centralize all assignments and student data for quick access",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <SettingOutlined style={{ fontSize: "28px", color: "#7c244b" }} />
                    <Title level={4} style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                      Customization and Control
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Personalize your school’s look with custom colors and fonts",
                      "Enhance security with multi-factor authentication and session management",
                      "Send important announcements to teachers, parents, or everyone",
                      "Generate and export reports for insights and compliance",
                      "Safely manage data with controlled reset options",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* TEACHERS */}
          <div style={{ marginBottom: "80px" }}>
            <Title level={2} className="section-title">
              Tools for Teachers
            </Title>
            <Paragraph className="section-subtitle">
              Simplify student tracking, focus on holistic development, and communicate directly with families.
            </Paragraph>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <LineChartOutlined style={{ fontSize: "24px", color: "#2081c3" }} />
                    <Title level={4} style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                      Track Student Growth
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Record daily insights on academics, skills, and well-being",
                      "Enter grades and assessment results effortlessly",
                      "Highlight areas for improvement with notes",
                      "Create customizable reports to share progress over time",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <LineChartOutlined style={{ fontSize: "24px", color: "#2081c3" }} />
                    <Title level={4} style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                      Collaborate on Action Plans
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Build shared plans to address student needs",
                      "Track and update progress together",
                      "Save effective plans as templates for future use",
                      "Add notes and ratings to monitor improvements",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <LineChartOutlined style={{ fontSize: "24px", color: "#2081c3" }} />
                    <Title level={4} style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                      Engage with Parents
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Chat directly in a secure space per student",
                      "Award badges to celebrate achievements",
                      "Reuse proven strategies from shared templates",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* PARENTS */}
          <div style={{ marginBottom: "60px" }}>
            <Title level={2} className="section-title">
              Tools for Parents
            </Title>
            <Paragraph className="section-subtitle">
              Stay connected to your child's classroom progress, collaborate on goals, and celebrate achievements.
            </Paragraph>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <TeamOutlined style={{ fontSize: "28px", color: "#e6af2e" }} />
                    <Title level={4} style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                      Stay Informed
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Switch views between multiple children easily",
                      "See at-a-glance summaries and progress trends",
                      "Get alerts for important updates or concerns",
                      "Review badges and achievements with your child",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <TeamOutlined style={{ fontSize: "28px", color: "#e6af2e" }} />
                    <Title level={4} style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                      Partner in Progress
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Respond to teacher notes and suggestions",
                      "Contribute to action plans from home",
                      "Update and track plan steps together",
                      "Communicate securely with teachers",
                      "Rate and refine strategies for better results",
                    ]}
                    renderItem={(item) => (
                      <div className="feature-list-item">
                        <CheckCircleOutlined style={{ color: "#e6af2e", marginRight: "12px", fontSize: "18px" }} />
                        <span>{item}</span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* SYSTEM OVERVIEW */}
          <div style={{ marginTop: "100px" }}>
            <Title level={2} className="section-title">
              System Overview
            </Title>
            <Paragraph className="section-subtitle">
              Learn about the robust security and modern engineering that powers CareCraft's parent-teacher network.
            </Paragraph>

            <Collapse accordion bordered={false} className="faq-collapse">
              <Collapse.Panel header="How It All Works Together" key="1">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  Seamless flow from school setup to daily tracking, collaborative planning, progress monitoring, and insightful reporting.
                </Paragraph>
              </Collapse.Panel>
              
              <Collapse.Panel header="Technology Behind CareCraft" key="2">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  Built with modern tools: Node/Express for the backend, React for the frontend, TypeScript for reliability, MongoDB for data storage. We use Ant Design (AntD) for the admin interface to provide powerful, customizable components for school administrators. Chakra UI powers the user-friendly interfaces for parents, teachers, and students, ensuring a responsive and accessible experience. Additionally, Redis is used for efficient job management, such as storing notifications and sending them intelligently: processing urgent ones immediately while handling non-urgent ones when the server is less busy to optimize performance.
                </Paragraph>
              </Collapse.Panel>

              <Collapse.Panel header="Key Components" key="3">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  Includes classes, subjects, teacher profiles, student observations, action plans, reports, badges, parent accounts, secure chats, and more – all designed for simplicity and security.
                </Paragraph>
              </Collapse.Panel>
            </Collapse>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <Title level={2}>Ready to Transform Your School?</Title>
          
          <Space size="large" wrap style={{ marginTop: "24px" }}>
            <Link to="/signin">
              <Button size="large" className="cc-btn-gold">
                Try Demo Account
              </Button>
            </Link>
            
            <Link to="/about">
              <Button size="large" className="cc-btn-blue">
                About Us
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
