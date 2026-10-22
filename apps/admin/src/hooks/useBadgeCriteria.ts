import { useQueryClient } from '@tanstack/react-query';
import {
  badgesKeys,
  invalidateBadgeQueries,
} from '@carecraft/badges';
import type {
  BadgeCriteria,
  BadgeCriteriaType,
  BadgeCriterionCreateInput,
  BadgeCriterionInput,
  BadgeScope,
} from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseBadgeCriteriaParams {
  badgeDefinitionId?: string;
  type?: BadgeCriteriaType;
  scope?: BadgeScope;
  attributeCategoryId?: string;
  pagination?: { page: number; pageSize: number };
}

export const useBadgeCriteria = ({
  badgeDefinitionId,
  type,
  scope,
  attributeCategoryId,
  pagination = { page: 1, pageSize: 10 },
}: UseBadgeCriteriaParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const params = new URLSearchParams();
  if (badgeDefinitionId) params.set('badgeDefinitionId', badgeDefinitionId);
  if (type) params.set('type', type);
  if (scope) params.set('scope', scope);
  if (attributeCategoryId) params.set('attributeCategoryId', attributeCategoryId);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/badgeCriteria?${params.toString()}`;
  const queryKey = badgesKeys.criteriaList({
    badgeDefinitionId,
    type,
    scope,
    attributeCategoryId,
    pagination,
  });

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
    enabled: Boolean(badgeDefinitionId),
  });

  const criteria: BadgeCriteria[] = raw?.success
    ? (raw.data as BadgeCriteria[])
    : [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: pagination.page, limit: pagination.pageSize };

  const create = async (data: BadgeCriterionCreateInput) => {
    const result = await post({ url: '/badgeCriteria', body: data });
    await invalidateBadgeQueries(queryClient, data.badgeDefinitionId);
    return result;
  };

  const update = async (
    id: string,
    data: BadgeCriterionInput,
    badgeId?: string,
  ) => {
    const result = await put({ url: `/badgeCriteria/${id}`, body: data });
    await invalidateBadgeQueries(queryClient, badgeId);
    return result;
  };

  const remove = async (id: string, badgeId?: string) => {
    const result = await del({ url: `/badgeCriteria/${id}` });
    await invalidateBadgeQueries(queryClient, badgeId);
    return result;
  };

  return {
    criteria,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,

    isLoading,
    isError,
    fetchError: error as any,

    refetch,
    create,
    update,
    remove,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
