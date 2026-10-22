import { Button, Space } from "antd";
import { DiffOutlined } from "@ant-design/icons";
import type {
  ICloneScheduleResult,
  IPublishScheduleResult,
  ISchedule,
} from "@carecraft/types";
import { PublishButton } from "./PublishButton";
import { CloneDraftButton } from "./CloneDraftButton";

interface ScheduleActionsProps {
  schedule: ISchedule;
  onPublished: (result: IPublishScheduleResult) => void;
  onCloned: (result: ICloneScheduleResult) => void;
  onReload: () => void;
  onGoToReadiness: () => void;
  onViewDrift: () => void;
}

/** Publish / clone / drift actions for the currently open schedule. */
export function ScheduleActions({
  schedule,
  onPublished,
  onCloned,
  onReload,
  onGoToReadiness,
  onViewDrift,
}: ScheduleActionsProps) {
  return (
    <Space wrap>
      <PublishButton
        schedule={schedule}
        onPublished={onPublished}
        onReload={onReload}
        onGoToReadiness={onGoToReadiness}
      />
      <CloneDraftButton schedule={schedule} onCloned={onCloned} />
      <Button icon={<DiffOutlined />} onClick={onViewDrift}>
        View drift
      </Button>
    </Space>
  );
}
