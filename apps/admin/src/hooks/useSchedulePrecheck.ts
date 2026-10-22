import { useApi } from '@/hooks/useApi';
import type { IPrecheckResult } from '@carecraft/types';

/**
 * GET /api/schedule/precheck?schoolYear=
 *
 * Runs the readiness (precheck) report for a school year. The report is
 * computed on the fly, so it is always fetched fresh.
 */
export const useSchedulePrecheck = (schoolYear?: string) => {
  const { get } = useApi();

  const base = '/schedule/precheck';
  const url = schoolYear
    ? `${base}?schoolYear=${encodeURIComponent(schoolYear)}`
    : base;

  const { data: raw, isLoading, isFetching, isError, error, refetch } = get(
    url,
    {
      queryKey: [base, { schoolYear }],
      enabled: !!schoolYear,
      staleTime: 0,
    }
  );

  const precheck: IPrecheckResult | null = raw?.success
    ? (raw.data as IPrecheckResult)
    : null;

  return {
    precheck,
    isLoading,
    isFetching,
    isError,
    fetchError: error as any,
    refetch,
  };
};
