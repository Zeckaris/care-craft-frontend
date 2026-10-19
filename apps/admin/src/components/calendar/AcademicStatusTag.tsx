import { Tag, Tooltip } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import type { AcademicStatus } from "@carecraft/types";
import {
  academicDisplayColor,
  academicDisplayKind,
  academicDisplayLabel,
} from "@/utils/academic";

interface AcademicStatusTagProps {
  status: AcademicStatus;
  isCurrent?: boolean;
}

export function AcademicStatusTag({
  status,
  isCurrent = false,
}: AcademicStatusTagProps) {
  const kind = academicDisplayKind(status, isCurrent);
  const tag = (
    <Tag
      color={academicDisplayColor(kind)}
      icon={kind === "current" ? <CrownOutlined /> : undefined}
    >
      {academicDisplayLabel(kind)}
    </Tag>
  );

  if (kind === "latest") {
    return (
      <Tooltip title="Not in session today; this is the most recent one.">
        {tag}
      </Tooltip>
    );
  }

  return tag;
}
