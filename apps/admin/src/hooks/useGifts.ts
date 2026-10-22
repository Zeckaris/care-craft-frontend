import { useQuery, useQueryClient } from '@tanstack/react-query';
import { extractApiErrorMessage } from '@carecraft/query-core';
import type { Gift, GiftOption } from '@carecraft/types';
import { apiClient } from '@/services/api-client';
import { useApi } from '@/hooks/useApi';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface GiftOptionsEnvelope {
  success: boolean;
  message?: string;
  data: GiftOption[];
}

export const GIFT_QUERY_ROOT = 'gift';

export const giftKeys = {
  root: [GIFT_QUERY_ROOT] as const,
  list: (params?: Record<string, unknown>) =>
    [GIFT_QUERY_ROOT, 'list', params ?? {}] as const,
  options: () => [GIFT_QUERY_ROOT, 'options'] as const,
};

export interface UseGiftsParams {
  name?: string;
  isActive?: boolean;
  pagination?: { page: number; pageSize: number };
}

export interface GiftInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  imageFile?: File | null;
}

function buildGiftBody(data: GiftInput): FormData {
  const body = new FormData();
  if (data.name !== undefined) body.append('name', data.name.trim());
  if (data.description !== undefined) {
    body.append('description', data.description.trim());
  }
  if (data.isActive !== undefined) body.append('isActive', String(data.isActive));
  if (data.imageFile) body.append('image', data.imageFile);
  return body;
}

export const useGifts = ({
  name = '',
  isActive,
  pagination = { page: 1, pageSize: 10 },
}: UseGiftsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } =
    useApi();

  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/gift?${params.toString()}`;

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(fetchUrl, {
    queryKey: giftKeys.list({ name, isActive, pagination }),
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const gifts: Gift[] = raw?.success ? (raw.data as Gift[]) : [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const invalidateGifts = () =>
    queryClient.invalidateQueries({ queryKey: giftKeys.root });

  const create = async (data: GiftInput) => {
    const result = await post({ url: '/gift', body: buildGiftBody(data) });
    invalidateGifts();
    return result;
  };

  const update = async (id: string, data: GiftInput) => {
    const result = await put({
      url: `/gift/${id}`,
      body: buildGiftBody(data),
    });
    invalidateGifts();
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/gift/${id}` });
    invalidateGifts();
    return result;
  };

  return {
    gifts,
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

export const useGiftOptions = () => {
  const query = useQuery<GiftOption[]>({
    queryKey: giftKeys.options(),
    queryFn: async () => {
      try {
        const response =
          await apiClient.get<GiftOptionsEnvelope>('/gift/options');
        const body = response.data;
        if (!body?.success) {
          throw new Error(body?.message || 'Failed to load gift options');
        }
        return body.data;
      } catch (error) {
        throw new Error(extractApiErrorMessage(error));
      }
    },
    staleTime: 30_000,
  });

  return {
    options: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
