import { Helmet } from "react-helmet-async";
import {
  Button,
  Typography,
  Row,
  Col,
  Carousel,
  Space,
  Card,
  Collapse,
} from "antd";
import { Link } from "react-router-dom";
import "@/public/styles/public.css";
import {
  LinkedinOutlined,
  SendOutlined,
  TwitterOutlined,
  GithubOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

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
                </Space>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="hero-image-wrapper">
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

      {/* SLIDER */}
      <section className="landing-slider">
        <Title level={2} className="section-title">
          See CareCraft in Action
        </Title>

        <Carousel autoplay arrows dots={false}>
          <div>
            <img src="/images/sc1.png" alt="Dashboard" />
          </div>
          <div>
            <img src="/images/sc2.png" alt="Badges" />
          </div>
          <div>
            <img src="/images/sc3.png" alt="Assessment" />
          </div>
          <div>
            <img src="/images/sc5.png" alt="Attributes" />
          </div>
        </Carousel>
      </section>

      {/* CORE VISION / WHY CARECRAFT */}
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

          <Row gutter={[40, 40]} justify="center" className="vision-icons">
            <Col xs={24} sm={12} md={8}>
              <Card hoverable bordered={false} className="icon-card">
                <img src="/images/academics.jfif" alt="Academics" />
                <Title level={4}>Academics</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable bordered={false} className="icon-card">
                <img src="/images/softSkills.jpg" alt="Soft Skills" />
                <Title level={4}>Soft Skills</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable bordered={false} className="icon-card">
                <img src="/images/socialSkills.jfif" alt="Social Skills" />
                <Title level={4}>Social Skills</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable bordered={false} className="icon-card">
                <img src="/images/emotional.jpg" alt="Emotional Growth" />
                <Title level={4}>Emotional Growth</Title>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* HOW CARECRAFT WORKS */}
      <section className="landing-how-it-works">
        <div className="container">
          <Title level={2} className="section-title">
            How CareCraft Works
          </Title>

          <Row gutter={[40, 40]}>
            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="step-card">
                <Title level={4}>Step 1: School Sets Up & Invites</Title>
                <Paragraph>
                  Admin creates classes, assigns teachers, adds students, and
                  generates secure invitation codes. Parents and teachers sign
                  up securely no public access.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="step-card">
                <Title level={4}>Step 2: Teachers Share Insights</Title>
                <Paragraph>
                  Teachers log structured observations with ratings on
                  academics, soft skills, social skills, emotional well-being,
                  and extracurriculars. Flags trigger alerts and collaborative
                  action plans for growth.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable bordered={false} className="step-card">
                <Title level={4}>Step 3: Parents & Teachers Collaborate</Title>
                <Paragraph>
                  Parents receive alerts, contribute to action plans, track
                  progress, and celebrate achievements together with badges and
                  trend reports.
                </Paragraph>
              </Card>
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
              <Card
                hoverable
                bordered={false}
                className="comparison-card telegram-card"
              >
                <Title level={4}>Telegram</Title>
                <ul>
                  <li>Public or shareable groups → privacy risks</li>
                  <li>Lost/delayed personal updates</li>
                  <li>Chaotic group chats → hard to track child's progress</li>
                  <li>No structured follow-up or action plans</li>
                </ul>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                hoverable
                bordered={false}
                className="comparison-card carecraft-card"
              >
                <Title level={4}>CareCraft Advantages</Title>
                <ul>
                  <li>Private per-student chats → fully secure</li>
                  <li>Digital updates → no lost notes</li>
                  <li>
                    Structured growth tracking → academics, soft skills,
                    emotional development
                  </li>
                  <li>
                    Joint action plans, badges, trends → celebrate achievements
                  </li>
                  <li>Optional admin tools → registration, fees, enrollment</li>
                  <li>Mobile-friendly → low-data optimized</li>
                </ul>
              </Card>
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

          <Collapse accordion bordered={false} className="faq-collapse">
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
                question: "Can CareCraft be used on phones with limited data?",
                answer:
                  "Yes. Mobile-first, lightweight design optimized for low-data connections in Ethiopia.",
              },
            ].map((faq, idx) => (
              <Panel header={faq.question} key={idx}>
                <Paragraph>{faq.answer}</Paragraph>
              </Panel>
            ))}
          </Collapse>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <Title level={2} className="section-title">
          Why Schools Choose CareCraft
        </Title>

        <Row gutter={[40, 48]} justify="center">
          <Col xs={24} md={8}>
            <Card hoverable bordered={false}>
              <Title level={4}>Private Chat per Student</Title>
              <Paragraph>
                Secure, focused messaging between teachers and parents.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable bordered={false}>
              <Title level={4}>Daily Growth Tracking</Title>
              <Paragraph>
                Academics, behavior, emotions and soft skills in one place.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable bordered={false}>
              <Title level={4}>Shared Action & Alerts</Title>
              <Paragraph>
                Flag concerns early. Plan together. Stay aligned.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <Title level={2}>Ready to Connect Your School Community?</Title>

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
