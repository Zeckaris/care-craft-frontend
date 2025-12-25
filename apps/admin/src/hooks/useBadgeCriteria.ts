import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IBadgeCriteria {
  _id: string;
  badgeDefinitionId: string;
  type: 'scoreThreshold' | 'actionPlanProgress' | 'observationCount' | 'custom' | 'attributeEvaluationAverage';
  attributeCategoryId?: string | null;
  minScore?: number | null;
  actionPlanId?: string | null;
  minProgress?: number | null;
  minObservations?: number | null;
  scope?: 'yearly' | 'allTime' | null;
  description?: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseBadgeCriteriaParams {
  badgeDefinitionId?: string;
  type?: IBadgeCriteria['type'];
  attributeCategoryId?: string;
  pagination?: { page: number; pageSize: number };
}

export const useBadgeCriteria = ({
  badgeDefinitionId,
  type,
  attributeCategoryId,
  pagination = { page: 1, pageSize: 10 },
}: UseBadgeCriteriaParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  // Build query params
  const params = new URLSearchParams();
  if (badgeDefinitionId) params.set('badgeDefinitionId', badgeDefinitionId);
  if (type) params.set('type', type);
  if (attributeCategoryId) params.set('attributeCategoryId', attributeCategoryId);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/badgeCriteria?${params.toString()}`;
  const queryKey = ['/badgeCriteria', { badgeDefinitionId, type, attributeCategoryId, pagination }];

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const criteria: IBadgeCriteria[] = raw?.success ? (raw.data as IBadgeCriteria[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // Mutations
  const create = async (data: Omit<IBadgeCriteria, '_id' | 'createdAt'>) => {
    const result = await post({ url: '/badgeCriteria', body: data });
    queryClient.invalidateQueries({ queryKey: ['/badgeCriteria'] });
    queryClient.invalidateQueries({ queryKey: ['/badgeDefinition'] }); // Invalidate definitions too
    return result;
  };

  const update = async (id: string, data: Partial<Omit<IBadgeCriteria, '_id' | 'createdAt'>>) => {
    const result = await put({ url: `/badgeCriteria/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/badgeCriteria'] });
    queryClient.invalidateQueries({ queryKey: ['/badgeDefinition'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/badgeCriteria/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/badgeCriteria'] });
    queryClient.invalidateQueries({ queryKey: ['/badgeDefinition'] });
    return result;
  };

  return {
    // Data
    criteria,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,

    // Loading & Error
    isLoading,
    isError,
    fetchError: error as any,

    // Actions
    refetch,
    create,
    update,
    remove,

    // Mutation states
    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};