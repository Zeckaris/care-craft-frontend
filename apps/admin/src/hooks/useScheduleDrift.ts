import { useApi } from '@/hooks/useApi';
import type { IScheduleDriftReport } from '@carecraft/types';

/**
 * GET /api/schedule/schedules/:id/drift
 *
 * Loads the drift report for a stored schedule. Fetched fresh whenever enabled
 * (for example when a drift drawer opens).
 */
export const useScheduleDrift = (scheduleId?: string, enabled = true) => {
  const { get } = useApi();

  const url = scheduleId
    ? `/schedule/schedules/${scheduleId}/drift`
    : '';

  const { data: raw, isLoading, isFetching, isError, error, refetch } = get(
    url,
    {
      queryKey: ['/schedule/schedules', scheduleId, 'drift'],
      enabled: enabled && !!scheduleId,
      staleTime: 0,
      retry: false,
    }
  );

  const drift: IScheduleDriftReport | null = raw?.success
    ? (raw.data as IScheduleDriftReport)
    : null;

  return {
    drift,
    isLoading,
    isFetching,
    isError,
    fetchError: error as unknown,
    refetch,
  };
};
