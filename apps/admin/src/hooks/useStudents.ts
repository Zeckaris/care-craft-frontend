import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IStudent {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  admissionDate: string;
  profileImage?: string;
  parentId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  } | null;
  enrollmentId?: {
    _id: string;
    gradeId: {
      _id: string;
      level: string;
    };
    schoolYear: string;
    isActive: boolean;
  } | null;
  createdAt?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseStudentsParams {
  gradeId?: string;
  pagination?: { page: number; pageSize: number };
  search?: string;
}

export const useStudents = ({
  gradeId,
  pagination = { page: 1, pageSize: 10 },
  search = '',
}: UseStudentsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }
  if (search) params.set('search', search);

  const fetchUrl = `/student?${params.toString()}`;
  const queryKey = ['/student', { gradeId, pagination, search }];

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

  const students: IStudent[] = raw?.success ? (raw.data as IStudent[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // === MUTATIONS ===
  const create = async (data: Omit<IStudent, '_id'>) => {
    const result = await post({ url: '/student', body: data });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const batchCreate = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await post({
      url: '/student/batch',
      body: formData,
    });

    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const update = async (id: string, data: Partial<IStudent>) => {
    const result = await put({ url: `/student/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/student/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    // Data
    students,
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
    batchCreate,
    update,
    remove,
    removeMany,

    // Mutation loading states
    isCreating: postMutation.isPending,
    isBatchCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};