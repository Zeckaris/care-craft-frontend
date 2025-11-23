import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export interface IGSA {
  _id: string;
  gradeId: {
    _id: string;
    level: string;
    description?: string | null;
  };
  subjectId: {
    _id: string;
    name: string;
    description?: string | null;
  };
  assessmentSetupId: {
    _id: string;
    name: string;
    description?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const useGSA = (
  {
    search = '',
    pagination = { page: 1, pageSize: 10 },
  }: {
    search?: string;
    pagination?: { page: number; pageSize: number };
  } = {}
) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/assessment/gsa';

  // Build query params
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

  const gsas: IGSA[] = raw?.success ? (raw.data as IGSA[]) : [];
  const paginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // Mutations
  const create = async (data: {
    gradeId: string;
    subjectId: string;
    assessmentSetupId?: string;
  }) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const update = async (id: string, data: Partial<{
    gradeId: string;
    subjectId: string;
    assessmentSetupId: string;
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
    gsas,
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