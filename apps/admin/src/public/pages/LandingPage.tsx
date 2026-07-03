import { Helmet } from "@dr.pogodin/react-helmet";
import { Button, Typography, Row, Col, Carousel, Space, Collapse } from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReadOutlined,
  BulbOutlined,
  TeamOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import "@/public/styles/public.css";

const { Title, Paragraph } = Typography;

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>
          CareCraft - Best Parent Teacher Communication App for Schools in
          Ethiopia
        </title>
        <meta
          name="description"
          content="Secure, affordable app for teacher-parent collaboration. Real-time chat, student progress tracking, action plans & emotional alerts."
        />
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-container">
          <Row align="middle" gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <div className="hero-text">
                <Title className="hero-title">CareCraft</Title>

                <Title level={3} className="hero-subtitle">
                  Simple, Secure Collaboration for Ethiopian Schools
                </Title>

                <Paragraph className="hero-description">
                  Secure teacher-parent chat. Track student progress. Share
                  action plans. Build stronger school communities.
                </Paragraph>

                <Space size="large" wrap style={{ marginTop: "16px" }}>
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
                </Space>
              </div>
            </Col>

            <Col
              xs={24}
              md={12}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div className="hero-image-container">
                <img
                  src="/images/childrenLearning.avif"
                  alt="Children learning in classroom"
                  className="hero-image"
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* SLIDER / IN ACTION */}
      <section className="landing-slider">
        <div className="container">
          <Title level={2} className="section-title">
            See CareCraft in Action
          </Title>

          <div className="carousel-container">
            <Carousel
              autoplay
              speed={800}
              autoplaySpeed={4000}
              dots={true}
              arrows={true}
            >
              <div className="carousel-slide">
                <img src="/images/sc1.png" alt="Dashboard" />
              </div>
              <div className="carousel-slide">
                <img src="/images/sc2.png" alt="Badges" />
              </div>
              <div className="carousel-slide">
                <img src="/images/sc3.png" alt="Assessment" />
              </div>
              <div className="carousel-slide">
                <img src="/images/sc5.png" alt="Attributes" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* WHY CARECRAFT (CORE VISION) */}
      <section className="landing-vision">
        <div className="container">
          <Title level={2} className="section-title">
            Why CareCraft?
          </Title>
          <Paragraph className="vision-text">
            CareCraft is not just a messaging app. It's a structured student
            development collaboration platform that turns everyday observations
            into measurable action across academics, emotional growth, social
            skills, and personal development.
          </Paragraph>

          <div className="vision-cards-grid">
            {/* ACADEMICS */}
            <div className="vision-card vision-card--burgundy">
              <div className="vision-card-inner">
                <div className="vision-card-icon-wrap">
                  <ReadOutlined className="vision-card-icon" />
                </div>
                <h4 className="vision-card-title">Academics</h4>
                <p className="vision-card-desc">
                  Track grades, assignments and subject progress with structured
                  assessments across every subject area.
                </p>
                <div className="vision-card-tag">Growth Tracking</div>
              </div>
              <div className="vision-card-fill" />
            </div>

            {/* SOFT SKILLS */}
            <div className="vision-card vision-card--blue">
              <div className="vision-card-inner">
                <div className="vision-card-icon-wrap">
                  <BulbOutlined className="vision-card-icon" />
                </div>
                <h4 className="vision-card-title">Soft Skills</h4>
                <p className="vision-card-desc">
                  Build confidence, communication and leadership through daily
                  observations and collaborative growth plans.
                </p>
                <div className="vision-card-tag">Character Building</div>
              </div>
              <div className="vision-card-fill" />
            </div>

            {/* SOCIAL SKILLS */}
            <div className="vision-card vision-card--gold">
              <div className="vision-card-inner">
                <div className="vision-card-icon-wrap">
                  <TeamOutlined className="vision-card-icon" />
                </div>
                <h4 className="vision-card-title">Social Skills</h4>
                <p className="vision-card-desc">
                  Nurture teamwork, empathy and peer relationships with targeted
                  teacher notes and parent insights.
                </p>
                <div className="vision-card-tag">Collaboration</div>
              </div>
              <div className="vision-card-fill" />
            </div>

            {/* EMOTIONAL GROWTH */}
            <div className="vision-card vision-card--green">
              <div className="vision-card-inner">
                <div className="vision-card-icon-wrap">
                  <HeartOutlined className="vision-card-icon" />
                </div>
                <h4 className="vision-card-title">Emotional Growth</h4>
                <p className="vision-card-desc">
                  Monitor well-being trends, flag emotional concerns early and
                  celebrate resilience milestones together.
                </p>
                <div className="vision-card-tag">Well-being</div>
              </div>
              <div className="vision-card-fill" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how-it-works">
        <div className="container">
          <Title level={2} className="section-title">
            How CareCraft Works
          </Title>

          <Row gutter={[32, 32]} style={{ marginTop: "24px" }}>
            <Col xs={24} md={8}>
              <div className="step-card">
                <div className="step-badge">1</div>
                <Title level={4}>Step 1: School Sets Up & Invites</Title>
                <Paragraph>
                  Admin creates classes, assigns teachers, adds students, and
                  generates secure invitation codes. Parents and teachers sign
                  up securely no public access.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="step-card">
                <div className="step-badge">2</div>
                <Title level={4}>Step 2: Teachers Share Insights</Title>
                <Paragraph>
                  Teachers log structured observations with ratings on
                  academics, soft skills, social skills, emotional well-being,
                  and extracurriculars. Flags trigger alerts and collaborative
                  action plans for growth.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="step-card">
                <div className="step-badge">3</div>
                <Title level={4}>Step 3: Parents & Teachers Collaborate</Title>
                <Paragraph>
                  Parents receive alerts, contribute to action plans, track
                  progress, and celebrate achievements together with badges and
                  trend reports.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="landing-comparison">
        <div className="container">
          <Title level={2} className="section-title">
            Why Switch From Telegram?
          </Title>

          <Row gutter={[40, 40]}>
            <Col xs={24} md={12}>
              <div className="comparison-card telegram-card">
                <Title level={4}>Telegram</Title>
                <ul className="comparison-list">
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>Public or shareable groups → privacy risks</span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>Lost/delayed personal updates</span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>
                      Chaotic group chats → hard to track child's progress
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>No structured follow-up or action plans</span>
                  </li>
                </ul>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="comparison-card carecraft-card">
                <div className="recommended-badge">Recommended</div>
                <Title level={4}>CareCraft Advantages</Title>
                <ul className="comparison-list">
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>Private per-student chats → fully secure</span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>Digital updates → no lost notes</span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Structured growth tracking → academics, soft skills,
                      emotional development
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Joint action plans, badges, trends → celebrate
                      achievements
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Optional admin tools → registration, fees, enrollment
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>Mobile-friendly → low-data optimized</span>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="landing-faq">
        <div className="container">
          <Title level={2} className="section-title">
            Frequently Asked Questions
          </Title>

          <div className="faq-two-col">
            <Collapse
              accordion={false}
              bordered={false}
              className="faq-collapse faq-collapse-col"
            >
              {[
                {
                  question: "What is CareCraft?",
                  answer:
                    "CareCraft is a secure parent teacher communication app in Ethiopia designed for schools. It goes beyond messaging to track academics, confidence, social skills, emotional growth, and extracurriculars, with shared action plans and dashboards.",
                },
                {
                  question:
                    "Why do Ethiopian schools and parents need CareCraft?",
                  answer:
                    "CareCraft turns Ethiopia's cultural strengths into structured growth. Teachers can flag concerns, share observations, create joint action plans, and track progress in skills like communication, confidence, teamwork, and emotional resilience.",
                },
                {
                  question: "Is CareCraft free to use?",
                  answer:
                    "Yes. Core features are completely free. Optional low-cost hosting/support is available. No ads or hidden fees.",
                },
                {
                  question: "How do parents sign up?",
                  answer:
                    "Parents receive a secure invitation code from the school. They sign up and link to their child securely. Multiple children can be managed in one account.",
                },
                {
                  question: "Does CareCraft support Amharic?",
                  answer:
                    "Yes. English is available now; Amharic support is rolling out for full accessibility across Ethiopia.",
                },
                {
                  question: "How private and secure is CareCraft?",
                  answer:
                    "All student data is encrypted and accessible only by assigned teachers and parents. No data is sold. No ads.",
                },
                {
                  question: "Can teachers and parents chat privately?",
                  answer:
                    "Yes. Each student has a private chat for their assigned teacher and parent(s), ideal for sensitive topics.",
                },
                {
                  question: "What updates can teachers share?",
                  answer:
                    "Structured observations with ratings on academics, soft skills, social skills, emotional well-being, and extracurriculars giving a full picture of the child’s growth.",
                },
                {
                  question:
                    "How does CareCraft build confidence and communication skills?",
                  answer:
                    "Flagged concerns trigger shared action plans where parents and teachers collaborate on steps. Progress is tracked and positive achievements rewarded with badges.",
                },
                {
                  question: "Do parents receive alerts for concerns?",
                  answer:
                    "Yes. Alerts show ratings, trends, and progress in real-time, keeping parents proactively involved.",
                },
                {
                  question:
                    "Can CareCraft be used on phones with limited data?",
                  answer:
                    "Yes. Mobile-first, lightweight design optimized for low-data connections in Ethiopia.",
                },
              ].map((faq, idx) => (
                <Collapse.Panel header={faq.question} key={idx}>
                  <Paragraph style={{ margin: 0 }}>{faq.answer}</Paragraph>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <Title level={2}>Ready to Connect Your School Community?</Title>

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
          </Space>
        </div>
      </section>
    </>
  );
}
