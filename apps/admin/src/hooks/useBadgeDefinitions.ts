import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  badgesKeys,
  invalidateBadgeQueries,
} from '@carecraft/badges';
import type { BadgeDefinition } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { apiClient } from '@/services/api-client';
import { useApi } from '@/hooks/useApi';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface BadgeDefinitionInput {
  name: string;
  description: string;
  howToEarn?: string;
  level: number;
  eligibleGrades?: string[];
  autoAward?: boolean;
}

interface UseBadgeDefinitionsParams {
  name?: string;
  level?: number;
  autoAward?: boolean;
  eligibleGradeId?: string;
  attributeCategoryId?: string;
  pagination?: { page: number; pageSize: number };
}

export const useBadgeDefinitions = ({
  name = '',
  level,
  autoAward,
  eligibleGradeId,
  attributeCategoryId,
  pagination = { page: 1, pageSize: 10 },
}: UseBadgeDefinitionsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (level !== undefined) params.set('level', String(level));
  if (autoAward !== undefined) params.set('autoAward', String(autoAward));
  if (eligibleGradeId) params.set('eligibleGradeId', eligibleGradeId);
  if (attributeCategoryId) params.set('attributeCategoryId', attributeCategoryId);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/badge?${params.toString()}`;
  const queryKey = badgesKeys.definitionList({
    name,
    level,
    autoAward,
    eligibleGradeId,
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
  });

  const definitions: BadgeDefinition[] = raw?.success
    ? (raw.data as BadgeDefinition[])
    : [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const buildBody = (data: Partial<BadgeDefinitionInput>, iconFile?: File) => {
    const formData = new FormData();

    if (data.name !== undefined) {
      formData.append('name', data.name.trim());
    }
    if (data.description !== undefined) {
      formData.append('description', data.description.trim());
    }
    if (data.howToEarn !== undefined) {
      formData.append('howToEarn', data.howToEarn.trim());
    }
    if (data.level !== undefined && !isNaN(data.level)) {
      formData.append('level', String(data.level));
    }
    if (data.eligibleGrades !== undefined) {
      data.eligibleGrades.forEach((gradeId) =>
        formData.append('eligibleGrades', gradeId),
      );
    }
    if (data.autoAward !== undefined) {
      formData.append('autoAward', String(data.autoAward));
    }
    if (iconFile) {
      formData.append('icon', iconFile);
    }

    return formData;
  };

  const create = async (data: BadgeDefinitionInput, iconFile?: File) => {
    const body = buildBody({ ...data, autoAward: false }, iconFile);
    const result = await post({ url: '/badge', body });
    await invalidateBadgeQueries(queryClient);
    return result;
  };

  const update = async (
    id: string,
    data: Partial<BadgeDefinitionInput>,
    iconFile?: File,
  ) => {
    const body = buildBody(data, iconFile);
    const result = await put({ url: `/badge/${id}`, body });
    await invalidateBadgeQueries(queryClient, id);
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/badge/${id}` });
    await invalidateBadgeQueries(queryClient);
    return result;
  };

  return {
    definitions,
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

interface DetailEnvelope {
  success: boolean;
  message?: string;
  data: BadgeDefinition;
}

export const useBadgeDefinitionDetail = (badgeId?: string) => {
  const query = useQuery<BadgeDefinition>({
    queryKey: badgesKeys.definitionDetail(badgeId ?? ''),
    queryFn: async () => {
      try {
        const response = await apiClient.get<DetailEnvelope>(
          `/badge/${badgeId}`,
        );
        if (!response.data?.success) {
          throw new Error(
            response.data?.message || 'Failed to load badge details',
          );
        }
        return response.data.data;
      } catch (error) {
        throw new Error(extractApiErrorMessage(error));
      }
    },
    enabled: Boolean(badgeId),
    staleTime: 15_000,
  });

  return {
    badge: query.data ?? null,
    isLoading: Boolean(badgeId) && query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

interface BadgeListEnvelope {
  success: boolean;
  message?: string;
  data: BadgeDefinition[];
  pagination?: PaginationMeta;
}

const BADGE_PICKER_PAGE_SIZE = 100;

async function fetchAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const badges: BadgeDefinition[] = [];
  let page = 1;

  while (true) {
    const response = await apiClient.get<BadgeListEnvelope>('/badge', {
      params: { page, limit: BADGE_PICKER_PAGE_SIZE },
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || 'Failed to load badges');
    }

    const batch = Array.isArray(body.data) ? body.data : [];
    badges.push(...batch);

    const total = body.pagination?.total;
    if (total !== undefined ? badges.length >= total : batch.length < BADGE_PICKER_PAGE_SIZE) {
      break;
    }
    if (batch.length === 0) break;

    page += 1;
    if (page > 1000) break;
  }

  return badges;
}

/** Loads every badge page so pickers never stop at the first page. */
export const useAllBadgeDefinitions = () => {
  const query = useQuery<BadgeDefinition[]>({
    queryKey: [...badgesKeys.definitionsRoot, 'all'],
    queryFn: fetchAllBadgeDefinitions,
    staleTime: 30_000,
  });

  return {
    definitions: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
