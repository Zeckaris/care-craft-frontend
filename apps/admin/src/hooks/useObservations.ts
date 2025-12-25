import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

export interface IObservation {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    _id: string;
    name: string;
    minScore: number;
    maxScore: number;
  };
  score: number;
  description: string;
  date: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseObservationsParams {
  studentId?: string;
  teacherId?: string;
  category?: string;
  pagination?: { page: number; pageSize: number };
}

export const useObservations = ({
  studentId,
  teacherId,
  category,
  pagination = { page: 1, pageSize: 10 },
}: UseObservationsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, del, deleteMutation } = useApi();

  // Build query params
  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (teacherId) params.set('teacherId', teacherId);
  if (category) params.set('category', category);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/observation?${params.toString()}`;
  const queryKey = ['/observation', { studentId, teacherId, category, pagination }];

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

  const observations: IObservation[] = raw?.success ? (raw.data as IObservation[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // Delete single observation
  const remove = async (id: string) => {
    const result = await del({ url: `/observation/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/observation'] });
    return result;
  };

  // Bulk delete by student (admin only)
  const bulkRemoveByStudent = async (studentId: string) => {
    const result = await del({ url: `/observation/student/${studentId}` });
    queryClient.invalidateQueries({ queryKey: ['/observation'] });
    return result;
  };

  return {
    // Data
    observations,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,

    // States
    isLoading,
    isError,
    fetchError: error as any,

    // Actions
    refetch,
    remove,
    bulkRemoveByStudent,

    // Mutation states
    isDeleting: deleteMutation.isPending,
  };
};