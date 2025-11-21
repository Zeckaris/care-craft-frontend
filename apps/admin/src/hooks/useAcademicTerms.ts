import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export interface IAcademicTerm {
  _id: string;
  name: string;
  calendarId: string;
  sequence?: number;
  startDate: string | Date;
  endDate: string | Date;
  isCurrent?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const useAcademicTerms = (academicYearId?: string) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, patch, postMutation, putMutation, deleteMutation, patchMutation } = useApi();

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

  const currentTerm = terms.find(t => t.isCurrent) || null;

  const create = async (data: Omit<IAcademicTerm, '_id'>) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const update = async (id: string, data: Partial<Omit<IAcademicTerm, '_id'>>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };


  const setCurrent = async (id: string) => {
    const result = await patch({ url: `${urlPath}/${id}/current`, body: {} });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  return {
    terms,
    currentTerm,
    isLoading,
    isError,
    error: error as any,
    refetch,

    create,
    update,
    remove,
    setCurrent,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingCurrent: patchMutation.isPending, 
  };
};