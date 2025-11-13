import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query'; 

export interface IGrade {
  _id: string;
  level: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const useGrades = (
  {
  search = '',
  pagination = { page: 1, pageSize: 10 },
}: {
  search?: string;
  pagination?: { page: number; pageSize: number };
} = {}
) => {
  const queryClient = useQueryClient(); // ← Add
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();
  const urlPath = '/grade';

  // Fetch
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }

  const fetchUrl = `${urlPath}?${params.toString()}`;
  const queryKey = [urlPath, { search, pagination }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const grades: IGrade[] = raw?.success ? (raw.data as IGrade[]) : [];
  const paginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // Mutations with auto-refetch
  const create = async (data: Omit<IGrade, '_id'>) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] }); // ← Refetch
    return result;
  };

  const update = async (id: string, data: Partial<Omit<IGrade, '_id'>>) => {
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
    const results = await Promise.all(ids.map(_id => remove(_id)));
    return results;
  };

  return {
    grades,
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