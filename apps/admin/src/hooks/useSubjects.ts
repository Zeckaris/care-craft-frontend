import { message } from 'antd';
import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface ISubject {
  _id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const useSubjects = () => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  // === FETCH ALL ===
  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/subject', {
    queryKey: ['/subject'],
    staleTime: 30_000,
  });

  const subjects: ISubject[] = raw?.success ? (raw.data as ISubject[]) : [];

  // === MUTATIONS ===
  const create = async (data: Omit<ISubject, '_id'>) => {
    const result = await post({ url: '/subject', body: data });
    queryClient.invalidateQueries({ queryKey: ['/subject'] });
    return result;
  };

  const update = async (id: string, data: Partial<ISubject>) => {
    const result = await put({ url: `/subject/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/subject'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/subject/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/subject'] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    subjects,
    isLoading,
    isError,
    fetchError: error as any,
    // Actions
    refetch,
    create,
    update,
    remove,
    removeMany,
    // Mutation loading states
    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};