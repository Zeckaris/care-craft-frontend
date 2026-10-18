import { useState } from "react";
import { Alert, Button, Modal, Space, Typography, message } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import type {
  IPrecheckResult,
  IPublishScheduleResult,
  ISchedule,
  IScheduleDriftReport,
  IScheduleUnplacedItem,
  IScheduleViolation,
} from "@carecraft/types";
import { usePublishSchedule } from "@/hooks/usePublishSchedule";
import {
  getErrorData,
  getErrorMessage,
  getErrorStatus,
} from "@/components/sections/studentAssignmentUtils";
import { IssueList } from "./ReadinessPanel";
import { DriftReportView } from "./DriftReportView";
import { UnplacedLessonsTable } from "./UnplacedLessonsTable";

const { Text, Paragraph } = Typography;

interface PublishButtonProps {
  schedule: ISchedule;
  onPublished: (result: IPublishScheduleResult) => void;
  /** Reload the open schedule (race / no-longer-a-draft). */
  onReload: () => void;
  onGoToReadiness: () => void;
}

type PublishIssue =
  | { kind: "precheck"; precheck: IPrecheckResult }
  | { kind: "violations"; violations: IScheduleViolation[] }
  | { kind: "drift"; drift: IScheduleDriftReport }
  | {
      kind: "unplaced";
      unplacedCount: number;
      unplaced: IScheduleUnplacedItem[];
    }
  | { kind: "notDraft"; message: string };

/** Publish action for an open draft, handling every 409 variant. */
export function PublishButton({
  schedule,
  onPublished,
  onReload,
  onGoToReadiness,
}: PublishButtonProps) {
  const { publish, isPublishing } = usePublishSchedule();
  const [issue, setIssue] = useState<PublishIssue | null>(null);

  if (schedule.status !== "draft") return null;

  const doPublish = async (allowUnplaced: boolean) => {
    try {
      const result = await publish(
        schedule.scheduleId,
        allowUnplaced ? { allowUnplaced: true } : {}
      );
      setIssue(null);
      if (result) {
        const archived = result.archivedPrevious?.length ?? 0;
        message.success(
          `Published${
            result.publishedAt
              ? ` at ${new Date(result.publishedAt).toLocaleString()}`
              : ""
          }.${archived ? ` ${archived} previous schedule${archived === 1 ? "" : "s"} archived.` : ""}`
        );
        onPublished(result);
      }
    } catch (err) {
      const status = getErrorStatus(err);
      const data = getErrorData(err) as Record<string, unknown> | null | undefined;

      if (status === 404) {
        message.error(getErrorMessage(err));
        onReload();
        return;
      }

      if (data && typeof data === "object") {
        if ("precheck" in data && data.precheck) {
          setIssue({ kind: "precheck", precheck: data.precheck as IPrecheckResult });
          return;
        }
        if ("violations" in data && data.violations) {
          setIssue({
            kind: "violations",
            violations: data.violations as IScheduleViolation[],
          });
          return;
        }
        if ("drift" in data && data.drift) {
          setIssue({ kind: "drift", drift: data.drift as IScheduleDriftReport });
          return;
        }
        if ("unplacedCount" in data || "unplaced" in data) {
          setIssue({
            kind: "unplaced",
            unplacedCount: Number(data.unplacedCount ?? 0),
            unplaced: (data.unplaced as IScheduleUnplacedItem[]) ?? [],
          });
          return;
        }
        if ("scheduleId" in data && data.scheduleId) {
          if ("status" in data) {
            setIssue({ kind: "notDraft", message: getErrorMessage(err) });
          } else {
            // Race: it is no longer a draft. Reload.
            message.info(getErrorMessage(err));
            onReload();
          }
          return;
        }
      }

      message.error(getErrorMessage(err));
    }
  };

  const confirmPublish = () => {
    Modal.confirm({
      title: "Publish this timetable?",
      content:
        "Teachers will see this timetable. The currently published schedule (if any) is archived.",
      okText: "Publish",
      cancelText: "Cancel",
      onOk: () => doPublish(false),
    });
  };

  const handleClose = () => setIssue(null);

  const renderIssue = () => {
    if (!issue) return null;

    switch (issue.kind) {
      case "precheck":
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Alert
              type="error"
              showIcon
              message="Readiness check failed"
              description="Fix the issues below, then publish again."
              action={
                <Button size="small" onClick={onGoToReadiness}>
                  Open Readiness
                </Button>
              }
            />
            <IssueList title="Errors" items={issue.precheck.errors} color="red" />
            <IssueList
              title="Warnings"
              items={issue.precheck.warnings}
              color="gold"
            />
          </Space>
        );
      case "violations":
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Alert
              type="error"
              showIcon
              message="Publishing is blocked by hard rule violations"
            />
            {issue.violations.length === 0 ? (
              <Text type="secondary">No details were returned.</Text>
            ) : (
              issue.violations.map((violation, index) => (
                <Alert
                  key={`${violation.rule}-${index}`}
                  type="error"
                  showIcon
                  message={violation.rule}
                  description={violation.message}
                />
              ))
            )}
          </Space>
        );
      case "drift":
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Alert
              type="warning"
              showIcon
              message="The data has drifted since generation"
              description="Regenerate the schedule, or clone it to a draft and fix the data, then publish."
            />
            <DriftReportView drift={issue.drift} />
          </Space>
        );
      case "unplaced":
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Alert
              type="warning"
              showIcon
              message={`${issue.unplacedCount} unplaced lesson${
                issue.unplacedCount === 1 ? "" : "s"
              } remain`}
              description="Publishing anyway will make the timetable visible to teachers with these lessons unplaced."
            />
            <UnplacedLessonsTable
              items={issue.unplaced}
              schoolYear={schedule.schoolYear}
            />
          </Space>
        );
      case "notDraft":
        return (
          <Alert
            type="info"
            showIcon
            message="This schedule is no longer a draft"
            description={issue.message}
          />
        );
    }
  };

  const issueTitle: Record<PublishIssue["kind"], string> = {
    precheck: "Readiness check failed",
    violations: "Cannot publish",
    drift: "Drift detected",
    unplaced: "Unplaced lessons",
    notDraft: "Not a draft",
  };

  const footerByKind = () => {
    if (!issue) return null;
    if (issue.kind === "unplaced") {
      return [
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="anyway"
          danger
          loading={isPublishing}
          onClick={() => doPublish(true)}
        >
          Publish anyway
        </Button>,
      ];
    }
    if (issue.kind === "notDraft") {
      return [
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
        <Button
          key="reload"
          type="primary"
          onClick={() => {
            handleClose();
            onReload();
          }}
        >
          Reload
        </Button>,
      ];
    }
    return [
      <Button key="close" onClick={handleClose}>
        Close
      </Button>,
    ];
  };

  return (
    <>
      <Button
        type="primary"
        icon={<CloudUploadOutlined />}
        loading={isPublishing}
        onClick={confirmPublish}
      >
        Publish
      </Button>

      <Modal
        open={!!issue}
        title={issue ? issueTitle[issue.kind] : "Publish"}
        onCancel={handleClose}
        footer={footerByKind()}
        width={issue?.kind === "drift" ? 780 : 620}
      >
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          {schedule.schoolYear}
        </Paragraph>
        {renderIssue()}
      </Modal>
    </>
  );
}
