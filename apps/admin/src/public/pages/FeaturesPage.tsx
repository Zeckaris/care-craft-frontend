import { Helmet } from "@dr.pogodin/react-helmet";
import {
  Typography,
  Row,
  Col,
  Card,
  List,
  Space,
  Collapse,
  Button,
} from "antd";
import { Link } from "react-router-dom";
import "@/public/styles/public.css";
import {
  CheckCircleOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

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

      {/* HERO - Reduced size */}
      <section
        className="landing-hero"
        style={{ padding: "60px 0", minHeight: "auto" }}
      >
        <div className="hero-container">
          <Title
            className="hero-title"
            style={{ textAlign: "center", fontSize: "48px" }}
          >
            CareCraft Features
          </Title>
          <Paragraph
            className="hero-description"
            style={{
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto 0 auto",
              fontSize: "18px",
            }}
          >
            Explore our comprehensive tools designed to enhance parent-teacher
            collaboration and student development.
          </Paragraph>
        </div>
      </section>

      {/* MAIN FEATURES SECTIONS */}
      <section className="landing-features" style={{ padding: "80px 60px" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {/* School Features - User-focused */}
          <Title level={2} className="section-title">
            Tools for School Administrators
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Streamlined Setup and Management</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Easily assign teachers to students and classes for personalized support",
                    "Create and organize subjects with custom assessments to track progress",
                    "Securely onboard teachers and connect parents to their children",
                    "Centralize all assignments and student data for quick access",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Customization and Control</Title>
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
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Teacher Features - User-focused */}
          <Title
            level={2}
            className="section-title"
            style={{ marginTop: "80px" }}
          >
            Tools for Teachers
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Track Student Growth</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Record daily insights on academics, skills, and well-being",
                    "Enter grades and assessment results effortlessly",
                    "Highlight areas for improvement with notes",
                    "Create customizable reports to share progress over time",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Collaborate on Action Plans</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Build shared plans to address student needs",
                    "Track and update progress together",
                    "Save effective plans as templates for future use",
                    "Add notes and ratings to monitor improvements",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Engage with Parents</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Chat directly in a secure space per student",
                    "Award badges to celebrate achievements",
                    "Reuse proven strategies from shared templates",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Parent Features - User-focused */}
          <Title
            level={2}
            className="section-title"
            style={{ marginTop: "80px" }}
          >
            Tools for Parents
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Stay Informed</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Switch views between multiple children easily",
                    "See at-a-glance summaries and progress trends",
                    "Get alerts for important updates or concerns",
                    "Review badges and achievements with your child",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card hoverable bordered={false} className="feature-card">
                <Title level={4}>Partner in Progress</Title>
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
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#e6af2e", marginRight: "12px" }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* System Flow / Tech - Updated */}
          <Title
            level={2}
            className="section-title"
            style={{ marginTop: "80px" }}
          >
            System Overview
          </Title>
          <Collapse accordion bordered={false} className="faq-collapse">
            <Panel header="How It All Works Together" key="1">
              <Paragraph>
                Seamless flow from school setup to daily tracking, collaborative
                planning, progress monitoring, and insightful reporting.
              </Paragraph>
            </Panel>
            <Panel header="Technology Behind CareCraft" key="2">
              <Paragraph>
                Built with modern tools: Node/Express for the backend, React for
                the frontend, TypeScript for reliability, MongoDB for data
                storage. We use Ant Design (AntD) for the admin interface to
                provide powerful, customizable components for school
                administrators. Chakra UI powers the user-friendly interfaces
                for parents, teachers, and students, ensuring a responsive and
                accessible experience. Additionally, Redis is used for efficient
                job management, such as storing notifications and sending them
                intelligently: processing urgent ones immediately while handling
                non-urgent ones when the server is less busy to optimize
                performance.
              </Paragraph>
            </Panel>
            <Panel header="Key Components" key="3">
              <Paragraph>
                Includes classes, subjects, teacher profiles, student
                observations, action plans, reports, badges, parent accounts,
                secure chats, and more – all designed for simplicity and
                security.
              </Paragraph>
            </Panel>
          </Collapse>
        </div>
      </section>

      {/* CTA - Added About link */}
      <section className="landing-cta">
        <Title level={2}>Ready to Transform Your School?</Title>
        <Space size="large" wrap>
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
          © {new Date().getFullYear()} CareCraft • Built for Elementary schools
        </Paragraph>
      </footer>
    </>
  );
}
