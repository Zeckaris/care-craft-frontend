import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { settleMutations } from '@carecraft/query-core';

export interface IAssessmentSetup {
  _id: string;
  name: string;
  description?: string | null;
  assessmentTypeIds: string[];
  createdAt?: string;
  updatedAt?: string;
  // Populated fields (from backend)
  types?: Array<{
    _id: string;
    name: string;
    weight: number;
    description?: string | null;
  }>;
}

export const useAssessmentSetups = () => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  // === FETCH ALL SETUPS ===
  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/assessment/setup', {
    queryKey: ['/assessment/setup'],
    staleTime: 30_000,
  });

  const setups: IAssessmentSetup[] = raw?.success ? (raw.data as IAssessmentSetup[]) : [];

  // === MUTATIONS ===
  const create = async (data: {
    name: string;
    description?: string | null;
    assessmentTypeIds: string[];
  }) => {
    const result = await post({ url: '/assessment/setup', body: data });
    queryClient.invalidateQueries({ queryKey: ['/assessment/setup'] });
    return result;
  };

  const update = async (
    id: string,
    data: Partial<{
      name: string;
      description?: string | null;
      assessmentTypeIds: string[];
    }>
  ) => {
    const result = await put({ url: `/assessment/setup/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/assessment/setup'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/assessment/setup/${id}`, toast: false });
    queryClient.invalidateQueries({ queryKey: ['/assessment/setup'] });
    return result;
  };

  const removeMany = (ids: string[]) =>
    settleMutations(
      ids.map(async (id) => {
        const result = await del({ url: `/assessment/setup/${id}`, toast: false });
        queryClient.invalidateQueries({ queryKey: ['/assessment/setup'] });
        return result;
      }),
    );

  return {
    // Data
    setups,
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