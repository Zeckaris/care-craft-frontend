/**
 * AttendanceAuthBanner — shows the shared session-expired prompt when
 * attendance syncing has been paused by a 401.
 */
import { useAttendanceQueue } from '@/context/AttendanceQueueContext';
import { SessionExpiredBanner } from '@/components/common/SessionExpiredBanner';

export function AttendanceAuthBanner() {
  const { authRequired, hasUnsynced } = useAttendanceQueue();
  return (
    <SessionExpiredBanner
      authRequired={authRequired}
      hasUnsynced={hasUnsynced}
      contextLabel="attendance"
    />
  );
}
