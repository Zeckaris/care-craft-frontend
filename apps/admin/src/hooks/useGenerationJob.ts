import { useApi } from '@/hooks/useApi';
import type { GenerationJobStatus, IGenerationJob } from '@carecraft/types';

const TERMINAL_STATUSES: GenerationJobStatus[] = [
  'completed',
  'failed',
  'cancelled',
];

const POLL_INTERVAL_MS = 1_500;

export const isTerminalJobStatus = (
  status: GenerationJobStatus | undefined | null
): boolean => !!status && TERMINAL_STATUSES.includes(status);

/**
 * GET /api/schedule/generation-jobs/:id
 *
 * Polls a generation job roughly every 1.5s and stops automatically once the
 * job reaches a terminal status. Callers switch `enabled` off when the user
 * leaves the Timetable tab so polling also stops in that case.
 */
export const useGenerationJob = (
  jobId: string | null | undefined,
  enabled: boolean
) => {
  const { get } = useApi();

  const url = jobId ? `/schedule/generation-jobs/${jobId}` : '';

  const { data: raw, isLoading, isError, error, refetch } = get(url, {
    queryKey: ['/schedule/generation-jobs', jobId],
    enabled: enabled && !!jobId,
    staleTime: 0,
    refetchInterval: (query: { state: { data?: unknown } }) => {
      const body = query.state.data as { data?: { status?: GenerationJobStatus } } | undefined;
      const status = body?.data?.status;
      return isTerminalJobStatus(status) ? false : POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
  });

  const job: IGenerationJob | null = raw?.success
    ? (raw.data as IGenerationJob)
    : null;

  return {
    job,
    isLoading,
    isError,
    fetchError: error as unknown,
    refetch,
  };
};
