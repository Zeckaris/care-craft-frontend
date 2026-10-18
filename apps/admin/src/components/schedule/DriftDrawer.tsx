import { Alert, Drawer, Skeleton } from "antd";
import { useScheduleDrift } from "@/hooks/useScheduleDrift";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";
import { DriftReportView } from "./DriftReportView";

interface DriftDrawerProps {
  scheduleId: string;
  open: boolean;
  onClose: () => void;
}

/** Drawer wrapper that loads and renders the drift report for a schedule. */
export function DriftDrawer({ scheduleId, open, onClose }: DriftDrawerProps) {
  const { drift, isLoading, isError, fetchError, refetch } = useScheduleDrift(
    scheduleId,
    open
  );

  return (
    <Drawer
      title="Drift report"
      width={720}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load the drift report"
          description={getErrorMessage(fetchError)}
          action={<a onClick={() => refetch()}>Retry</a>}
        />
      ) : drift ? (
        <DriftReportView drift={drift} />
      ) : (
        <Alert
          type="info"
          showIcon
          message="No drift report available for this schedule."
        />
      )}
    </Drawer>
  );
}
