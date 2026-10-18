import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  IScheduleRequirementsData,
  IScheduleRequirementsCopyResult,
  IScheduleRequirementInputItem,
} from '@carecraft/types';

/**
 * GET    /api/schedule/requirements?schoolYear=&gradeId=
 * PUT    /api/schedule/requirements
 * POST   /api/schedule/requirements/copy
 * DELETE /api/schedule/requirements/:id
 *
 * Requirements define which subjects a grade is scheduled for in a school
 * year. Saving replaces the grade's whole list in one request.
 */
export const useScheduleRequirements = (
  schoolYear?: string,
  gradeId?: string
) => {
  const queryClient = useQueryClient();
  const { get, put, post, del, putMutation, postMutation, deleteMutation } =
    useApi();

  const base = '/schedule/requirements';
  const enabled = !!schoolYear && !!gradeId;

  const params = new URLSearchParams();
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (gradeId) params.set('gradeId', gradeId);
  const url = `${base}?${params.toString()}`;
  const queryKey = [base, { schoolYear, gradeId }];

  const { data: raw, isLoading, isError, error, refetch } = get(url, {
    queryKey,
    enabled,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const requirements: IScheduleRequirementsData | null = raw?.success
    ? (raw.data as IScheduleRequirementsData)
    : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [base] });
    queryClient.invalidateQueries({ queryKey: ['/schedule/precheck'] });
  };

  const save = async (items: IScheduleRequirementInputItem[]) => {
    const result = await put({
      url: base,
      body: { schoolYear, gradeId, items },
      invalidateKey: false,
    });
    invalidate();
    return result?.data as IScheduleRequirementsData | undefined;
  };

  const removeItem = async (itemId: string) => {
    const result = await del({
      url: `${base}/${itemId}`,
      invalidateKey: false,
    });
    invalidate();
    return result;
  };

  const copy = async (params: {
    fromGradeId: string;
    toGradeId: string;
    overwrite?: boolean;
  }): Promise<IScheduleRequirementsCopyResult | undefined> => {
    const result = await post({
      url: `${base}/copy`,
      body: { schoolYear, ...params },
      invalidateKey: false,
    });
    invalidate();
    return result?.data as IScheduleRequirementsCopyResult | undefined;
  };

  return {
    requirements,
    isLoading,
    isError,
    fetchError: error as any,
    refetch,

    save,
    removeItem,
    copy,

    isSaving: putMutation.isPending,
    isCopying: postMutation.isPending,
    isRemoving: deleteMutation.isPending,
  };
};
