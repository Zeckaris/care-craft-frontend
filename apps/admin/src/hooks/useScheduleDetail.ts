import { useApi } from '@/hooks/useApi';
import type { IScheduleWithEntries } from '@carecraft/types';

interface UseScheduleDetailParams {
  schoolYear?: string;
  /**
   * When set, loads that stored schedule (GET /schedules/:id). When omitted,
   * loads the current draft for the school year (GET /draft), which answers
   * 404 when no draft exists.
   */
  scheduleId?: string;
  enabled?: boolean;
}

/**
 * GET /api/schedule/schedules/:id  (when `scheduleId` is set)
 * GET /api/schedule/draft?schoolYear=  (otherwise)
 *
 * Returns a schedule together with its entries. A 404 (no draft, or a deleted
 * schedule) is surfaced as `isNotFound` rather than a hard error so callers can
 * render an empty state.
 */
export const useScheduleDetail = ({
  schoolYear,
  scheduleId,
  enabled = true,
}: UseScheduleDetailParams) => {
  const { get } = useApi();

  const byId = !!scheduleId;
  const url = byId
    ? `/schedule/schedules/${scheduleId}`
    : schoolYear
      ? `/schedule/draft?schoolYear=${encodeURIComponent(schoolYear)}`
      : '';

  const queryKey = byId
    ? ['/schedule/schedules', scheduleId]
    : ['/schedule/draft', { schoolYear }];

  const { data: raw, isLoading, isError, error, refetch } = get(url, {
    queryKey,
    enabled: enabled && !!url,
    staleTime: 5_000,
    retry: false,
  });

  const data: IScheduleWithEntries | null = raw?.success
    ? (raw.data as IScheduleWithEntries)
    : null;

  const status = (error as { response?: { status?: number } } | undefined)
    ?.response?.status;

  return {
    schedule: data?.schedule ?? null,
    entries: data?.entries ?? [],
    isLoading,
    isError,
    isNotFound: isError && status === 404,
    fetchError: error as unknown,
    refetch,
  };
};
