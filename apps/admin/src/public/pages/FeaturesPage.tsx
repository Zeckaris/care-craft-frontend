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
        <title>CareCraft Features | Complete School Management System</title>
        <meta
          name="description"
          content="Explore CareCraft's tools for school administrators, teachers and parents: enrollment, sections, timetables, attendance, results, observations and badges."
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
              Set up your school, run the timetable and keep an eye on every classroom.
            </Paragraph>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card hoverable bordered={false} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <SettingOutlined style={{ fontSize: "28px", color: "#7c244b" }} />
                    <Title level={4} style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                      Setup and Enrollment
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Set up the academic calendar, grades, subjects and assessments",
                      "Enroll students one by one or import them from Excel",
                      "Generate sections automatically, then adjust sizes and move students between sections",
                      "Invite teachers, coordinators and parents with secure invitation codes",
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
                      Teaching, Insight and Control
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Assign homeroom and subject teachers, then generate and publish the school-wide timetable",
                      "Watch attendance, results and the classes that need support on a live dashboard",
                      "Review results by section and subject",
                      "Send announcements to teachers, admins, coordinators, parents or students",
                      "Apply your color palette and fonts, add email verification at sign-in, and switch features such as observations on or off",
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
              Take attendance, enter marks and record student growth from your phone, even when the network is unreliable.
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
                      "Enter marks out of each assessment's weight, even without a connection",
                      "Complete and lock a stage once the marks are final",
                      "Record observations about a student's progress and behavior",
                      "Evaluate the character and soft-skill attributes your school defines",
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
                      Work Without a Reliable Connection
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Install CareCraft on your phone like an app",
                      "Take attendance offline and let it sync when the network returns",
                      "Enter marks offline and sync them later",
                      "Check your published timetable offline, with the current period highlighted",
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
                      Recognize and Stay Focused
                    </Title>
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      "Award badges to celebrate achievements, as a homeroom teacher",
                      "Work only with the sections and subjects assigned to you",
                      "Get in-app notifications that you can read and clear in one tap",
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
                      "Get notified when your child is absent or late",
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
                      "View your child's results",
                      "Get insights from your child's teacher in each subject",
                      "Respond to teacher notes and suggestions",
                      "Communicate securely with teachers",
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
              See how CareCraft fits together, from school setup to daily classroom work.
            </Paragraph>

            <Collapse accordion bordered={false} className="faq-collapse">
              <Collapse.Panel header="How It All Works Together" key="1">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  The school sets up its calendar, grades and subjects, enrolls students, builds sections and generates the timetable. Teachers then run each day from their phones, taking attendance and entering marks, while admins follow live insights.
                </Paragraph>
              </Collapse.Panel>
              
              <Collapse.Panel header="Technology Behind CareCraft" key="2">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  CareCraft is a modern web application. The admin interface is built with React, TypeScript and Ant Design, and the teacher app is an installable, phone-friendly app built with React, TypeScript and Tailwind. A Node and Express backend with MongoDB stores the data, and a background job queue handles notifications.
                </Paragraph>
              </Collapse.Panel>

              <Collapse.Panel header="Key Components" key="3">
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.8", color: "var(--text-main)", margin: 0 }}>
                  Includes academic calendars, grades and sections, subjects and assessments, teacher assignments, timetables, attendance, results, observations, attribute evaluations, badges and notifications, all designed for simplicity and security.
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
