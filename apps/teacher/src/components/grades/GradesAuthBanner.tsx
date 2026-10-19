/**
 * GradesAuthBanner — shows the shared session-expired prompt when the marks
 * queue has been paused by a 401.
 */
import { useGradesQueue } from '@/context/GradesQueueContext';
import { SessionExpiredBanner } from '@/components/common/SessionExpiredBanner';

export function GradesAuthBanner() {
  const { authRequired, hasUnsynced } = useGradesQueue();
  return (
    <SessionExpiredBanner authRequired={authRequired} hasUnsynced={hasUnsynced} contextLabel="marks" />
  );
}
