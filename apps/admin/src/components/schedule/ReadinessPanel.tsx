import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { IPrecheckIssue } from "@carecraft/types";
import { useSchedulePrecheck } from "@/hooks/useSchedulePrecheck";
import { describePrecheckRefs, getPrecheckGuidance } from "./scheduleUtils";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";

const { Text } = Typography;

interface ReadinessPanelProps {
  schoolYear: string;
}

export function IssueList({
  title,
  items,
  color,
}: {
  title: string;
  items: IPrecheckIssue[];
  color: string;
}) {
  return (
    <Card title={`${title} (${items.length})`} size="small">
      {items.length === 0 ? (
        <Text type="secondary">None.</Text>
      ) : (
        <List
          dataSource={items}
          renderItem={(item) => {
            const guidance = getPrecheckGuidance(item.code);
            const detail = describePrecheckRefs(item.refs);
            return (
              <List.Item>
                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                  <Space wrap>
                    <Tag color={color}>{item.code}</Tag>
                    <Text strong>{item.message}</Text>
                  </Space>
                  {detail && <Text type="secondary">{detail}</Text>}
                  {guidance && (
                    <Text type="secondary" italic>
                      Fix: {guidance}
                    </Text>
                  )}
                </Space>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}

export function ReadinessPanel({ schoolYear }: ReadinessPanelProps) {
  const { precheck, isLoading, isFetching, isError, fetchError, refetch } =
    useSchedulePrecheck(schoolYear);

  const refreshButton = (
    <Button
      icon={<ReloadOutlined />}
      onClick={() => refetch()}
      loading={isFetching}
    >
      Refresh
    </Button>
  );

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not run the readiness check"
        description={getErrorMessage(fetchError)}
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!precheck) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No readiness report available for this school year yet."
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          {refreshButton}
        </div>
      </Card>
    );
  }

  const { ok, errors, warnings, summary } = precheck;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card
        size="small"
        title={
          <Space>
            <span>Readiness</span>
            <Tag color={ok ? "green" : "red"}>
              {ok ? "Ready" : "Not ready"}
            </Tag>
          </Space>
        }
        extra={refreshButton}
      >
        <Space size="large" wrap>
          <Statistic title="Sections" value={summary.sections} />
          <Statistic title="Teachers" value={summary.teachers} />
          <Statistic
            title="Lessons to place"
            value={summary.totalLessonsToPlace}
          />
          <Statistic title="Total slots" value={summary.totalSlots} />
          <Statistic
            title="Weekly slots / section"
            value={summary.weeklySlotsPerSection}
          />
        </Space>
      </Card>

      <IssueList title="Errors" items={errors} color="red" />
      <IssueList title="Warnings" items={warnings} color="gold" />
    </Space>
  );
}
