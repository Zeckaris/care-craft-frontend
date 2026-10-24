import { useState } from "react";
import { Button, Modal } from "antd";
import type { ButtonProps } from "antd";
import {
  CloseOutlined,
  ReadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { resolveSignInUrl } from "@carecraft/utils";

type TryDemoButtonProps = Omit<ButtonProps, "onClick">;

export default function TryDemoButton({
  children,
  ...buttonProps
}: TryDemoButtonProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const teacherSignInUrl = resolveSignInUrl(
    import.meta.env.VITE_TEACHER_APP_URL,
    "http://localhost:5174",
    import.meta.env.DEV,
  );

  const close = () => setOpen(false);

  const handleAdmin = () => {
    close();
    navigate("/signin");
  };

  const handleTeacher = () => {
    if (!teacherSignInUrl) return;
    close();
    window.location.assign(teacherSignInUrl);
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children}
      </Button>

      <Modal
        open={open}
        onCancel={close}
        footer={null}
        centered
        width={460}
        title="Try the demo"
        closeIcon={<CloseOutlined />}
        styles={{
          content: {
            borderRadius: 18,
            padding: "24px 24px 20px",
          },
          header: {
            background: "transparent",
            marginBottom: 4,
            padding: 0,
          },
          body: {
            paddingTop: 4,
          },
        }}
      >
        <p className="try-demo-intro">
          Choose which app you want to explore. You can load the demo account
          on the sign-in page.
        </p>

        <div className="try-demo-options">
          <button
            type="button"
            className="try-demo-option"
            onClick={handleAdmin}
          >
            <span className="try-demo-option-icon" aria-hidden="true">
              <SettingOutlined />
            </span>
            <span className="try-demo-option-text">
              <span className="try-demo-option-title">Admin</span>
              <span className="try-demo-option-desc">
                Manage students, staff, timetables and school reports.
              </span>
            </span>
          </button>

          <button
            type="button"
            className="try-demo-option"
            onClick={handleTeacher}
            disabled={!teacherSignInUrl}
            aria-disabled={!teacherSignInUrl}
          >
            <span className="try-demo-option-icon" aria-hidden="true">
              <ReadOutlined />
            </span>
            <span className="try-demo-option-text">
              <span className="try-demo-option-title">Teacher</span>
              <span className="try-demo-option-desc">
                {teacherSignInUrl
                  ? "Take attendance, enter marks and track student progress."
                  : "Teacher demo is not configured for this deployment."}
              </span>
            </span>
          </button>
        </div>
      </Modal>
    </>
  );
}
