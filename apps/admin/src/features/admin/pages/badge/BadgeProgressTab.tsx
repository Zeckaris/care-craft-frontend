import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import type {
  StudentBadgeProgressCriterion,
  StudentBadgeProgressItem,
} from "@carecraft/types";
import { formatCriterionProgress } from "@carecraft/badges";
import { extractApiErrorMessage } from "@carecraft/query-core";
import { useStudentBadgeProgress } from "@/hooks/useStudentBadgeProgress";
import { useStudents } from "@/hooks/useStudents";
import { formatDate } from "@/utils/dateFormat";
import {
  getBadgeLevelLabel,
  getStudentBadgeSourceMeta,
} from "@/utils/badges";

const { Text, Title } = Typography;

function CriterionProgress({
  criterion,
}: {
  criterion: StudentBadgeProgressCriterion;
}) {
  const progress = formatCriterionProgress(criterion);
  const showStateText =
    progress.stateText &&
    progress.status !== "pending" &&
    progress.status !== "manual";

  return (
    <Card size="small" style={{ marginTop: 12 }}>
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Space wrap>
          <Text strong>{progress.typeLabel}</Text>
          {progress.scopeLabel && <Tag>{progress.scopeLabel}</Tag>}
          <Text type="secondary">{progress.valueText}</Text>
          {progress.status === "met" && <Tag color="green">Met</Tag>}
          {progress.status === "pending" && <Tag>Not met</Tag>}
          {progress.status === "waiting" && <Tag color="gold">Waiting</Tag>}
          {progress.status === "notApplicable" && (
            <Tag color="default">Not applicable</Tag>
          )}
          {progress.status === "insufficient" && (
            <Tag color="orange">Not enough data</Tag>
          )}
          {progress.status === "manual" && <Tag>Manual</Tag>}
        </Space>

        {progress.percent !== null && progress.status !== "notApplicable" && (
          <Progress
            percent={Math.round(progress.percent)}
            showInfo={false}
            status={progress.status === "met" ? "success" : "normal"}
          />
        )}

        {showStateText && (
          <Text
            type={progress.status === "notApplicable" ? "secondary" : "warning"}
          >
            {progress.stateText}
          </Text>
        )}

        {progress.detailText && (
          <Text type="secondary">{progress.detailText}</Text>
        )}
      </Space>
    </Card>
  );
}

function BadgeProgressCard({ item }: { item: StudentBadgeProgressItem }) {
  const sourceMeta = getStudentBadgeSourceMeta(item.source);

  return (
    <Card style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <Space align="start">
            <Avatar
              size={56}
              icon={<TrophyOutlined />}
              src={item.badge.icon || undefined}
              style={{ backgroundColor: "#f56a00" }}
            />
            <Space direction="vertical" size={2}>
              <Space wrap>
                <Text strong>{item.badge.name}</Text>
                <Tag>{getBadgeLevelLabel(item.badge.level)}</Tag>
              </Space>
              {item.badge.description && (
                <Text type="secondary">{item.badge.description}</Text>
              )}
              {item.badge.howToEarn && (
                <Text type="secondary">
                  How to earn: {item.badge.howToEarn}
                </Text>
              )}
            </Space>
          </Space>

          {item.earned && (
            <Space wrap>
              <Tag color="green">Earned</Tag>
              <Text type="secondary">
                {sourceMeta.label}
                {item.awardedAt ? `, ${formatDate(item.awardedAt)}` : ""}
              </Text>
            </Space>
          )}
        </div>

        {item.criteria.length === 0 ? (
          <Text type="secondary">No criteria defined for this badge.</Text>
        ) : (
          item.criteria.map((criterion) => (
            <CriterionProgress
              key={criterion.criterionId}
              criterion={criterion}
            />
          ))
        )}
      </Space>
    </Card>
  );
}

export default function BadgeProgressTab() {
  const [studentId, setStudentId] = useState<string | undefined>(undefined);

  const { students, isLoading: studentsLoading } = useStudents({
    pagination: { page: 1, pageSize: 1000 },
  });
  const { data, isLoading, isError, error, refetch } =
    useStudentBadgeProgress(studentId);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student._id,
        label: `${student.firstName} ${student.lastName}`,
      })),
    [students],
  );

  const sortedBadges = useMemo(() => {
    if (!data) return [];
    return [...data.badges].sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? 1 : -1;
      if (a.badge.level !== b.badge.level) {
        return a.badge.level - b.badge.level;
      }
      return a.badge.name.localeCompare(b.badge.name);
    });
  }, [data]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Select
        style={{ width: 320 }}
        placeholder="Select a student"
        allowClear
        showSearch
        optionFilterProp="label"
        options={studentOptions}
        loading={studentsLoading}
        value={studentId}
        onChange={(value) => setStudentId(value || undefined)}
      />

      {!studentId ? (
        <Empty description="Select a student to view badge progress for the current term" />
      ) : isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert
          type="error"
          message="Failed to load badge progress"
          description={extractApiErrorMessage(error)}
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : data ? (
        <>
          <Card>
            <Space direction="vertical" size={2}>
              <Title level={5} style={{ margin: 0 }}>
                {data.academicTerm.name}
              </Title>
              <Text strong>{data.schoolYear}</Text>
              <Text type="secondary">
                {formatDate(data.academicTerm.startDate)} to{" "}
                {formatDate(data.academicTerm.endDate)}
              </Text>
            </Space>
          </Card>

          {sortedBadges.length === 0 ? (
            <Empty description="No badges are available for this student" />
          ) : (
            sortedBadges.map((item) => (
              <BadgeProgressCard key={item.badge._id} item={item} />
            ))
          )}
        </>
      ) : null}
    </Space>
  );
}
