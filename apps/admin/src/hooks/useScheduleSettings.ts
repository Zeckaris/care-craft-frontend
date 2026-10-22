import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  IScheduleSettings,
  IScheduleDerived,
  IScheduleSettingsData,
  IScheduleSettingsPayload,
} from '@carecraft/types';

/**
 * GET /api/schedule/settings?schoolYear=
 * PUT /api/schedule/settings
 *
 * Settings describe the bell schedule and teacher limits for a school year.
 * Both `settings` and `derived` are null until the year is configured.
 */
export const useScheduleSettings = (schoolYear?: string) => {
  const queryClient = useQueryClient();
  const { get, put, putMutation } = useApi();

  const base = '/schedule/settings';
  const queryKey = [base, { schoolYear }];
  const url = schoolYear
    ? `${base}?schoolYear=${encodeURIComponent(schoolYear)}`
    : base;

  const { data: raw, isLoading, isError, error, refetch } = get(url, {
    queryKey,
    enabled: !!schoolYear,
    staleTime: 30_000,
  });

  const data = raw?.success ? (raw.data as IScheduleSettingsData) : null;
  const settings: IScheduleSettings | null = data?.settings ?? null;
  const derived: IScheduleDerived | null = data?.derived ?? null;

  const save = async (
    payload: IScheduleSettingsPayload
  ): Promise<IScheduleSettingsData | undefined> => {
    const result = await put({
      url: base,
      body: payload,
      invalidateKey: ['/schedule'],
    });
    queryClient.invalidateQueries({ queryKey: ['/schedule'] });
    return result?.data as IScheduleSettingsData | undefined;
  };

  return {
    settings,
    derived,
    isLoading,
    isError,
    fetchError: error as any,
    refetch,
    save,
    isSaving: putMutation.isPending,
  };
};
