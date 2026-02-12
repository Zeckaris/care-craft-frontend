import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IBadgeDefinition {
  _id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  criteria: {
    _id: string;
    type: string;
    attributeCategoryId?: string | null;
    minScore?: number | null;
    actionPlanId?: string | null;
    minProgress?: number | null;
    minObservations?: number | null;
    scope?: string | null;
    description?: string;
  }[];
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseBadgeDefinitionsParams {
  name?: string;
  level?: number;
  attributeCategoryId?: string;
  pagination?: { page: number; pageSize: number };
}

export const useBadgeDefinitions = ({
  name = '',
  level,
  attributeCategoryId,
  pagination = { page: 1, pageSize: 10 },
}: UseBadgeDefinitionsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (level !== undefined) params.set('level', String(level));
  if (attributeCategoryId) params.set('attributeCategoryId', attributeCategoryId);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/badge?${params.toString()}`;
  const queryKey = ['/badge', { name, level, attributeCategoryId, pagination }];

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

  const definitions: IBadgeDefinition[] = raw?.success ? (raw.data as IBadgeDefinition[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const buildBody = (
    data: {
      name?: string;
      description?: string;
      level?: number;
      criteria?: string[];
    },
    iconFile?: File
  ) => {
    const formData = new FormData();

    if (data.name !== undefined && data.name?.trim()) {
      formData.append('name', data.name.trim());
    }
    if (data.description !== undefined && data.description?.trim()) {
      formData.append('description', data.description.trim());
    }
    if (data.level !== undefined && !isNaN(data.level)) {
      formData.append('level', String(data.level));
    }
    if (data.criteria !== undefined && Array.isArray(data.criteria)) {
      data.criteria.forEach((c) => formData.append('criteria', c));
    }
    if (iconFile) {
      formData.append('icon', iconFile);
    }

    return formData;
  };

  const create = async (
    data: {
      name: string;
      description: string;
      level: number;
      criteria?: string[];
    },
    iconFile?: File
  ) => {
    const body = buildBody(data, iconFile);
    const result = await post({ url: '/badge', body });
    queryClient.invalidateQueries({ queryKey: ['/badge'] });
    return result;
  };

  const update = async (
    id: string,
    data: {
      name?: string;
      description?: string;
      level?: number;
      criteria?: string[];
    },
    iconFile?: File
  ) => {
    const body = buildBody(data, iconFile);
    const result = await put({ url: `/badge/${id}`, body });
    queryClient.invalidateQueries({ queryKey: ['/badge'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/badge/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/badge'] });
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