import { useQueryClient } from '@tanstack/react-query';
import { BADGES_QUERY_ROOT } from '@carecraft/badges';
import type { StudentBadge, StudentBadgeSource } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseStudentBadgesParams {
  studentId?: string;
  badgeId?: string;
  schoolYear?: string;
  academicTermId?: string;
  source?: StudentBadgeSource;
  awardedBy?: string;
  pagination?: { page: number; pageSize: number };
}

export interface AwardStudentBadgeInput {
  badgeId: string;
  studentId: string;
  note?: string;
}

export const useStudentBadges = ({
  studentId,
  badgeId,
  schoolYear,
  academicTermId,
  source,
  awardedBy,
  pagination = { page: 1, pageSize: 10 },
}: UseStudentBadgesParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (badgeId) params.set('badgeId', badgeId);
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (academicTermId) params.set('academicTermId', academicTermId);
  if (source) params.set('source', source);
  if (awardedBy) params.set('awardedBy', awardedBy);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/studentBadge?${params.toString()}`;
  const queryKey = [
    '/studentBadge',
    {
      studentId,
      badgeId,
      schoolYear,
      academicTermId,
      source,
      awardedBy,
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

  const awards: StudentBadge[] = raw?.success
    ? (raw.data as StudentBadge[])
    : [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const invalidateAwards = () => {
    queryClient.invalidateQueries({ queryKey: ['/studentBadge'] });
    queryClient.invalidateQueries({ queryKey: [BADGES_QUERY_ROOT] });
  };

  const create = async (data: AwardStudentBadgeInput) => {
    const result = await post({ url: '/studentBadge', body: data });
    invalidateAwards();
    return result;
  };

  const update = async (id: string, data: { note: string }) => {
    const result = await put({ url: `/studentBadge/${id}`, body: data });
    invalidateAwards();
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/studentBadge/${id}` });
    invalidateAwards();
    return result;
  };

  return {
    awards,
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
