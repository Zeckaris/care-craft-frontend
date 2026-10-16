import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import type { ISection } from '@carecraft/types';

export type { ISection };

interface UseSectionsParams {
  gradeId?: string;
  schoolYear?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const useSections = ({
  gradeId,
  schoolYear,
  isActive,
  page = 1,
  pageSize = 10,
}: UseSectionsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/section';

  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  params.set('page', String(page));
  params.set('limit', String(pageSize));

  const fetchUrl = `${urlPath}?${params.toString()}`;
  const queryKey = [urlPath, { gradeId, schoolYear, isActive, page, pageSize }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const sections: ISection[] = raw?.success ? (raw.data as ISection[]) : [];
  const paginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const create = async (data: {
    gradeId: string;
    schoolYear: string;
    name: string;
    isActive?: boolean;
  }) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const update = async (
    id: string,
    data: Partial<{ name: string; isActive: boolean; gradeId: string; schoolYear: string }>
  ) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  return {
    sections,
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
