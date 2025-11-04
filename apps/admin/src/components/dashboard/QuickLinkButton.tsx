import { Button } from "antd";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface QuickLinkButtonProps {
  to: string;
  icon: ReactNode;
  label: string;
}

export const QuickLinkButton = ({ to, icon, label }: QuickLinkButtonProps) => {
  return (
    <Link to={to}>
      <Button
        type="text"
        className="quick-link"
        style={{ width: "100%", height: 60 }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span>{label}</span>
      </Button>
    </Link>
  );
};
