import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export interface IAttributeCategory {
  _id: string;
  name: string;
  description?: string;
  minScore: number;
  maxScore: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useAttributeCategories = (
  {
    search = '',
    pagination = { page: 1, pageSize: 10 },
    all= false
  }: {
    search?: string;
    pagination?: { page: number; pageSize: number };
    all ?:boolean
  } = {}
) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/attribute';
  // Build query params
  const params = new URLSearchParams();

  if (all) {
    params.set('all', 'true');
  } else {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }
  if (search) params.set('name', search);

  const fetchUrl = `${urlPath}?${params.toString()}`;
  const queryKey = [urlPath, { search, pagination, all }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const categories: IAttributeCategory[] = raw?.success ? (raw.data as IAttributeCategory[]) : [];
  const paginationMeta = raw?.pagination ?? { total: categories.length, page: 1, limit: categories.length };

  // Mutations
  const create = async (data: {
    name: string;
    description?: string;
    minScore: number;
    maxScore: number;
  }) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const update = async (id: string, data: Partial<{
    name: string;
    description?: string;
    minScore: number;
    maxScore: number;
  }>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    categories,
    isLoading,
    isError,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,
    fetchError: error as any,
    refetch,

    create,
    update,
    remove,
    removeMany,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};