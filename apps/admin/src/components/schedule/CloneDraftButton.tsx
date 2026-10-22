import { Button, Modal, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import type { ICloneScheduleResult, ISchedule } from "@carecraft/types";
import { useCloneSchedule } from "@/hooks/useCloneSchedule";
import {
  getErrorData,
  getErrorMessage,
  getErrorStatus,
} from "@/components/sections/studentAssignmentUtils";

interface CloneDraftButtonProps {
  schedule: ISchedule;
  onCloned: (result: ICloneScheduleResult) => void;
  /** Render as an inline link (list rows) instead of a full button. */
  link?: boolean;
  disabled?: boolean;
}

/** "Create draft from this" action for a published or archived schedule. */
export function CloneDraftButton({
  schedule,
  onCloned,
  link = false,
  disabled = false,
}: CloneDraftButtonProps) {
  const { clone, isCloning } = useCloneSchedule();

  const canClone =
    schedule.status === "published" || schedule.status === "archived";

  const runClone = async (replaceExistingDraft: boolean) => {
    try {
      const result = await clone(schedule.scheduleId, {
        ...(replaceExistingDraft ? { replaceExistingDraft: true } : {}),
      });
      if (result) {
        message.success("Draft created from this schedule.");
        onCloned(result);
      }
    } catch (err) {
      const status = getErrorStatus(err);
      const data = getErrorData(err) as { scheduleId?: string } | null | undefined;

      if (
        status === 409 &&
        data &&
        typeof data === "object" &&
        data.scheduleId &&
        !replaceExistingDraft
      ) {
        Modal.confirm({
          title: "A draft already exists",
          content:
            "Creating a draft from this schedule will replace the existing draft and all of its placed lessons.",
          okText: "Replace draft",
          okButtonProps: { danger: true },
          cancelText: "Cancel",
          onOk: () => runClone(true),
        });
        return;
      }

      message.error(getErrorMessage(err));
    }
  };

  if (!canClone) return null;

  if (link) {
    return (
      <a
        onClick={() => {
          if (!isCloning && !disabled) runClone(false);
        }}
      >
        <CopyOutlined /> Create draft from this
      </a>
    );
  }

  return (
    <Button
      icon={<CopyOutlined />}
      loading={isCloning}
      disabled={disabled}
      onClick={() => runClone(false)}
    >
      Create draft from this
    </Button>
  );
}
