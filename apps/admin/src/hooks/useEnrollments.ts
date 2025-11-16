import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IEnrollment {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    profileImage?: string;
  };
  gradeId: {
    _id: string;
    level: string;
  };
  schoolYear: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseEnrollmentsParams {
  gradeId?: string;
  schoolYear?: string;
  isActive?: boolean;
  pagination?: { page: number; pageSize: number };
  search?: string;
}

export const useEnrollments = ({
  gradeId,
  schoolYear,
  isActive,
  pagination = { page: 1, pageSize: 10 },
  search = '',
}: UseEnrollmentsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation,patch } = useApi();

  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }
  if (search) params.set('search', search);

  const fetchUrl = `/enrollment?${params.toString()}`;
  const queryKey = ['/enrollment', { gradeId, schoolYear, isActive, pagination, search }];

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

  const enrollments: IEnrollment[] = raw?.success ? (raw.data as IEnrollment[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // === MUTATIONS ===
  const create = async (data: { studentId: string; gradeId: string; schoolYear?: string }) => {
    const result = await post({ url: '/enrollment', body: data });
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    return result;
  };

  const bulkCreate = async (data: { studentIds: string[]; gradeId: string; schoolYear?: string }) => {
    const result = await post({ url: '/enrollment/bulk', body: data });
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    return result;
  };

  const update = async (id: string, data: Partial<Pick<IEnrollment, 'gradeId' | 'schoolYear' | 'isActive'>>) => {
    const result = await put({ url: `/enrollment/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    return result;
  };

const toggleActive = async (id: string) => {
  const result = await patch({ url: `/enrollment/${id}/active`, body: {} });
  queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
  return result;
};
  const remove = async (id: string) => {
    const result = await del({ url: `/enrollment/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    // Data
    enrollments,
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
    bulkCreate,
    update,
    toggleActive,
    remove,
    removeMany,

    // Mutation loading states
    isCreating: postMutation.isPending,
    isBulkCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isToggling: postMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};