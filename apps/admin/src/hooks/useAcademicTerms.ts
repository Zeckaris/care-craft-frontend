import { useQueryClient } from '@tanstack/react-query';
import type { IAcademicTerm } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

export interface AcademicTermInput {
  calendarId: string;
  name: string;
  sequence: number;
  startDate: string;
  endDate: string;
}

export const useAcademicTerms = (academicYearId?: string) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/term';

  const queryKey = academicYearId ? [urlPath, academicYearId] : [urlPath];
  const url = academicYearId ? `/term/calendar/${academicYearId}` : null;

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(url!, {
    queryKey,
    staleTime: 60_000,
    enabled: !!academicYearId,
  });

  const terms: IAcademicTerm[] = academicYearId && raw?.success
    ? (raw.data as IAcademicTerm[])
    : [];

  const currentTerm = terms.find((term) => term.isCurrent) ?? null;

  const invalidateAcademicData = () => {
    queryClient.invalidateQueries({ queryKey: ['/term'] });
    queryClient.invalidateQueries({ queryKey: ['/term/current'] });
    queryClient.invalidateQueries({ queryKey: ['/calendar'] });
    queryClient.invalidateQueries({ queryKey: ['/calendar/current'] });
    queryClient.invalidateQueries({ queryKey: ['/calendar/current-context'] });
  };

  const create = async (data: AcademicTermInput) => {
    const result = await post({ url: urlPath, body: data });
    invalidateAcademicData();
    return result;
  };

  const update = async (id: string, data: Partial<AcademicTermInput>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    invalidateAcademicData();
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    invalidateAcademicData();
    return result;
  };

  return {
    terms,
    currentTerm,
    isLoading,
    isError,
    error,
    refetch,

    create,
    update,
    remove,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
