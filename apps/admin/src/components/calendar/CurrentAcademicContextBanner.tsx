import { Card, Space, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import type { AcademicContextPhase } from "@carecraft/types";
import { useCurrentAcademicContext } from "@/hooks/useCurrentAcademicContext";

const { Text } = Typography;

const PHASE_LABELS: Record<AcademicContextPhase, string> = {
  "in-term": "In term",
  "between-terms": "Between terms",
  "before-first-term": "Before first term",
  "between-years": "Between years",
  none: "No academic calendar",
};

const PHASE_COLORS: Record<AcademicContextPhase, string> = {
  "in-term": "green",
  "between-terms": "gold",
  "before-first-term": "blue",
  "between-years": "purple",
  none: "default",
};

export function CurrentAcademicContextBanner() {
  const { context, isLoading } = useCurrentAcademicContext();

  if (isLoading || !context) return null;

  const { phase, currentCalendar, currentTerm, today } = context;
  const year = currentCalendar?.academicYear;
  const term = currentTerm?.name;
  const yearIsCurrent = currentCalendar?.status === "current";

  const yearLine = year ? (
    <Text>
      {yearIsCurrent ? "Academic year" : "Latest year"}:{" "}
      <strong>{year}</strong>
    </Text>
  ) : null;

  let content: ReactNode;

  switch (phase) {
    case "in-term":
      content = (
        <Space size="middle" wrap>
          <Text>
            Current term: <strong>{term ?? "None"}</strong>
          </Text>
          {yearLine}
        </Space>
      );
      break;
    case "between-terms":
      content = (
        <Space size="middle" wrap>
          <Text>
            {term ? (
              <>
                Between terms. Latest term: <strong>{term}</strong>
              </>
            ) : (
              "Between terms"
            )}
          </Text>
          {yearLine}
        </Space>
      );
      break;
    case "before-first-term":
      content = (
        <Space size="middle" wrap>
          <Text>
            {term ? (
              <>
                Before the first term. Next term: <strong>{term}</strong>
              </>
            ) : (
              "Before the first term"
            )}
          </Text>
          {yearLine}
        </Space>
      );
      break;
    case "between-years":
      content = (
        <Text>
          {year && term ? (
            <>
              Between academic years. Latest year: <strong>{year}</strong>,
              latest term: <strong>{term}</strong>
            </>
          ) : year ? (
            <>
              Between academic years. Latest year: <strong>{year}</strong>
            </>
          ) : term ? (
            <>
              Between academic years. Latest term: <strong>{term}</strong>
            </>
          ) : (
            "Between academic years"
          )}
        </Text>
      );
      break;
    case "none":
    default:
      content = <Text>No academic calendar defined</Text>;
      break;
  }

  return (
    <Card size="small" style={{ marginBottom: 24 }}>
      <Space size="large" wrap>
        <Space>
          <CalendarOutlined />
          <Text strong>Current academic context</Text>
        </Space>
        <Tag color={PHASE_COLORS[phase] ?? "default"}>
          {PHASE_LABELS[phase] ?? phase}
        </Tag>
        {content}
        <Text type="secondary">Today: {today}</Text>
      </Space>
    </Card>
  );
}
