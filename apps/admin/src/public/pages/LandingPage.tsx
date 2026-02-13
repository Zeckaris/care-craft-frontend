import { Helmet } from "react-helmet-async";
import { Button, Typography, Row, Col, Carousel, Space, Card } from "antd";
import { Link } from "react-router-dom";
import "@/public/styles/public.css";
import {
  LinkedinOutlined,
  SendOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

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
        </Carousel>
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
          <a href="#">
            <TwitterOutlined />
          </a>
          <a href="#">
            <LinkedinOutlined />
          </a>
          <a href="#">
            <SendOutlined />
          </a>
        </Space>

        <Paragraph>
          © {new Date().getFullYear()} CareCraft • Built for Ethiopian schools
        </Paragraph>
      </footer>
    </>
  );
}
