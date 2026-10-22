import { useQueryClient } from '@tanstack/react-query';
import type { IObservation } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseObservationsParams {
  studentId?: string;
  teacherId?: string;
  subjectId?: string;
  schoolYear?: string;
  term?: string;
  from?: string;
  to?: string;
  pagination?: { page: number; pageSize: number };
}

export const useObservations = ({
  studentId,
  teacherId,
  subjectId,
  schoolYear,
  term,
  from,
  to,
  pagination = { page: 1, pageSize: 10 },
}: UseObservationsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, del, deleteMutation } = useApi();

  // Build query params
  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (teacherId) params.set('teacherId', teacherId);
  if (subjectId) params.set('subjectId', subjectId);
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (term) params.set('term', term);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/observation?${params.toString()}`;
  const queryKey = [
    '/observation',
    {
      studentId,
      teacherId,
      subjectId,
      schoolYear,
      term,
      from,
      to,
      pagination,
    },
  ];

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

  const observations: IObservation[] = raw?.success
    ? (raw.data as IObservation[])
    : [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: 1, limit: 10 };

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
    fetchError: error,

    // Actions
    refetch,
    remove,
    bulkRemoveByStudent,

    // Mutation states
    isDeleting: deleteMutation.isPending,
  };
};
