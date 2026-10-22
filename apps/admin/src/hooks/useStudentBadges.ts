import { useQueryClient } from '@tanstack/react-query';
import {
  badgesKeys,
  invalidateStudentGiftQueries,
} from '@carecraft/badges';
import type {
  GiftStatus,
  StudentBadge,
  StudentBadgeSource,
} from '@carecraft/types';
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
  giftStatus?: Exclude<GiftStatus, 'none'>;
  pagination?: { page: number; pageSize: number };
}

export interface AwardStudentBadgeInput {
  badgeId: string;
  studentId: string;
  note?: string;
}

export interface UpdateStudentBadgeGiftInput {
  given: boolean;
  note?: string;
}

export const useStudentBadges = ({
  studentId,
  badgeId,
  schoolYear,
  academicTermId,
  source,
  awardedBy,
  giftStatus,
  pagination = { page: 1, pageSize: 10 },
}: UseStudentBadgesParams = {}) => {
  const queryClient = useQueryClient();
  const {
    get,
    post,
    put,
    patch,
    del,
    postMutation,
    putMutation,
    patchMutation,
    deleteMutation,
  } = useApi();

  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (badgeId) params.set('badgeId', badgeId);
  if (schoolYear) params.set('schoolYear', schoolYear);
  if (academicTermId) params.set('academicTermId', academicTermId);
  if (source) params.set('source', source);
  if (awardedBy) params.set('awardedBy', awardedBy);
  if (giftStatus) params.set('giftStatus', giftStatus);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/studentBadge?${params.toString()}`;
  const queryKey = badgesKeys.studentAwards({
    studentId,
    badgeId,
    schoolYear,
    academicTermId,
    source,
    awardedBy,
    giftStatus,
    pagination,
  });

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
    queryClient.invalidateQueries({ queryKey: badgesKeys.studentAwardsRoot });
    queryClient.invalidateQueries({ queryKey: badgesKeys.root });
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

  const updateGift = async (
    id: string,
    data: UpdateStudentBadgeGiftInput,
  ): Promise<{ data?: StudentBadge; message?: string }> => {
    const result = await patch({
      url: `/studentBadge/${id}/gift`,
      body: data,
    });
    await invalidateStudentGiftQueries(queryClient, id);
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
    updateGift,
    remove,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isUpdatingGift: patchMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
