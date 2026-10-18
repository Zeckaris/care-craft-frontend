import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type { IDiscardScheduleResult, ISchedule } from '@carecraft/types';

/**
 * GET    /api/schedule/schedules?schoolYear=
 * DELETE /api/schedule/schedules/:id
 *
 * Lists the stored schedules for a school year (newest first, no entries) and
 * discards a draft. Discarding is only valid for drafts; the backend answers
 * 409 for anything else.
 */
export const useSchedules = (schoolYear?: string) => {
  const queryClient = useQueryClient();
  const { get, del, deleteMutation } = useApi();

  const base = '/schedule/schedules';
  const url = schoolYear
    ? `${base}?schoolYear=${encodeURIComponent(schoolYear)}`
    : base;

  const { data: raw, isLoading, isFetching, isError, error, refetch } = get(
    url,
    {
      queryKey: [base, { schoolYear }],
      enabled: !!schoolYear,
      staleTime: 10_000,
    }
  );

  const schedules: ISchedule[] = raw?.success ? (raw.data as ISchedule[]) : [];

  const discard = async (
    scheduleId: string
  ): Promise<IDiscardScheduleResult | undefined> => {
    const result = await del({
      url: `${base}/${scheduleId}`,
      invalidateKey: false,
    });
    queryClient.invalidateQueries({ queryKey: [base] });
    return result?.data as IDiscardScheduleResult | undefined;
  };

  return {
    schedules,
    isLoading,
    isFetching,
    isError,
    fetchError: error as unknown,
    refetch,

    discard,
    isDiscarding: deleteMutation.isPending,
  };
};
