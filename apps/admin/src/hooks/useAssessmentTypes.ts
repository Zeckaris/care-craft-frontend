import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IAssessmentType {
  _id: string;
  name: string;
  weight: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const useAssessmentTypes = () => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  // === FETCH ALL ===
  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/assessment/type', {
    queryKey: ['/assessment/type'],
    staleTime: 30_000,
  });

  const types: IAssessmentType[] = raw?.success ? (raw.data as IAssessmentType[]) : [];

  // === MUTATIONS ===
  const create = async (data: Omit<IAssessmentType, '_id'>) => {
    const result = await post({ url: '/assessment/type', body: data });
    queryClient.invalidateQueries({ queryKey: ['/assessment/type'] });
    return result;
  };

  const update = async (id: string, data: Partial<IAssessmentType>) => {
    const result = await put({ url: `/assessment/type/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/assessment/type'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/assessment/type/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/assessment/type'] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    // Data
    types,
    // Loading & Error
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