import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export interface IAcademicCalendar {
  _id: string;
  academicYear: string;
  startDate: string | Date;
  endDate: string | Date;
  isCurrent: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const useAcademicCalendars = () => {
  const queryClient = useQueryClient();
  // MAKE SURE YOU DESTRUCTURE 'patch' HERE
  const { get, post, put, del, patch, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/calendar';
  const queryKey = [urlPath];

  const { 
    data: raw, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = get(urlPath, {
    queryKey,
    staleTime: 60_000,
  });

  const calendars: IAcademicCalendar[] = raw?.success 
    ? (raw.data as IAcademicCalendar[]) 
    : [];

  const currentCalendar = calendars.find(c => c.isCurrent) || null;

  const create = async (data: Omit<IAcademicCalendar, '_id'>) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey });
    return result;
  };

  const update = async (id: string, data: Partial<Omit<IAcademicCalendar, '_id'>>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey });
    return result;
  };

  const setCurrent = async (id: string) => {
    const result = await patch({ url: `${urlPath}/${id}/current`, body: {} });
    queryClient.invalidateQueries({ queryKey });
    return result;
  };

  return {
    calendars,
    currentCalendar,
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
  };
};