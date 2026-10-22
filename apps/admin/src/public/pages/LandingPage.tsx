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
          CareCraft | School Management System for Ethiopian Schools
        </title>
        <meta
          name="description"
          content="Enrollment, timetables, attendance, results and parent updates in one system built for Ethiopian schools."
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
                  One system to run your whole school.
                </Title>

                <Paragraph className="hero-description">
                  Enroll students, assign teachers, generate timetables, take
                  attendance, record results and keep families informed. Built
                  in Addis Ababa for how Ethiopian schools actually work.
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
            CareCraft is a complete school management system. It runs the daily
            work of a school, from enrollment, timetables and attendance to
            marks and results, and it goes further by tracking academics,
            social skills, emotional growth and personal development, so every
            child is seen as a whole person and not just a set of grades.
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
                  observations and character evaluations.
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
            <Col xs={24} md={6}>
              <div className="step-card">
                <div className="step-badge">1</div>
                <Title level={4}>Step 1: School Sets Up & Invites</Title>
                <Paragraph>
                  The school creates the academic calendar, grades and subjects,
                  then invites teachers and parents with secure invitation
                  codes.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={6}>
              <div className="step-card">
                <div className="step-badge">2</div>
                <Title level={4}>Step 2: Enroll & Organize</Title>
                <Paragraph>
                  Students are enrolled one by one or imported from Excel. Each
                  grade is split into sections automatically, but the school
                  sets the section sizes and can move any student to another
                  section. Teachers are assigned to sections and subjects, and
                  the school-wide timetable is generated in one pass.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={6}>
              <div className="step-card">
                <div className="step-badge">3</div>
                <Title level={4}>Step 3: Teachers Run the Day</Title>
                <Paragraph>
                  Teachers take attendance, enter marks and record observations
                  from their phones, even on an unreliable connection.
                  Everything syncs as soon as the network returns.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={6}>
              <div className="step-card">
                <div className="step-badge">4</div>
                <Title level={4}>Step 4: Everyone Stays Informed</Title>
                <Paragraph>
                  Admins see live insights, parents are notified when their
                  child is absent, and results are locked once teachers complete
                  them.
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
                    <span>Public or shareable groups are a privacy risk</span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>Personal updates get lost or delayed</span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>
                      Chaotic group chats make it hard to follow a child's
                      progress
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: "18px" }}
                    />
                    <span>No structured follow-up or record of progress</span>
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
                    <span>Direct contact with each student's homeroom teacher</span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>Digital records, so no lost notes</span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Structured growth tracking across academics, soft skills
                      and emotional development
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Tailored observations and remarks from each subject
                      teacher
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Features your school can switch on or off, such as
                      observations and attribute evaluations
                    </span>
                  </li>
                  <li className="comparison-item">
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "18px" }}
                    />
                    <span>
                      Take attendance and enter marks from a phone, even without
                      a connection. Everything syncs later.
                    </span>
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
                    "CareCraft is a complete school management system built for Ethiopian schools. It handles enrollment, sections, teacher assignments, timetables, attendance, marks and results, and parent notifications, and it tracks soft skills and personal growth alongside grades.",
                },
                {
                  question: "Why do Ethiopian schools need CareCraft?",
                  answer:
                    "Many schools still run on paper registers, Excel marklists and Telegram groups, which makes records hard to keep accurate and student progress hard to see. CareCraft brings everything into one system designed around how Ethiopian schools work, including marks entered out of each assessment's weight, academic years that run from September to July, and flexible daily period patterns.",
                },
                {
                  question: "Is CareCraft free to use?",
                  answer:
                    "Yes. Core features are completely free, with no ads or hidden fees.",
                },
                {
                  question: "How do teachers and parents sign up?",
                  answer:
                    "The school sends each teacher and parent a secure invitation code. They sign up with it, and a parent's account is linked to their child from the start.",
                },
                {
                  question: "Can CareCraft build our class timetable?",
                  answer:
                    "Yes. The school sets its daily period pattern and how many periods each subject gets per week, and CareCraft generates a school-wide timetable in one pass. Teachers then see their own schedule in the app.",
                },
                {
                  question: "Does it work with a poor internet connection?",
                  answer:
                    "Yes. Teachers can take attendance and enter marks without a connection, and everything syncs when the network returns. CareCraft runs as a phone-friendly web app that can be installed on a teacher's phone.",
                },
                {
                  question: "How private and secure is our school's data?",
                  answer:
                    "Access is role based, so admins, teachers and parents only see what their role allows. Passwords are stored securely, and schools can turn on email verification codes at sign-in. No data is sold and there are no ads.",
                },
                {
                  question: "Can our school choose which features to use?",
                  answer:
                    "Yes. Admins can switch features such as observations and attribute evaluations on or off in settings, and the school's own color palette and fonts are applied across the app.",
                },
                {
                  question:
                    "How does CareCraft track growth beyond grades?",
                  answer:
                    "Teachers record observations about a student and evaluate character and soft-skill attributes that the school defines. These sit alongside grades, so progress is seen as a whole.",
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
          <Title level={2}>Ready to run your school on CareCraft?</Title>

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
