import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  badgesKeys,
  invalidateBadgeQueries,
} from '@carecraft/badges';
import type { StudentBadge } from '@carecraft/types';
import { apiClient } from '@/services/api-client';
import { useApi } from '@/hooks/useApi';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

export interface AwardBadgeInput {
  badgeId: string;
  studentId: string;
  note?: string;
}

const PAGE_SIZE = 50;
export const STUDENT_BADGES_QUERY_ROOT = ['studentBadge', 'list'] as const;

export async function fetchAllStudentBadges(
  studentId: string,
  academicTermId: string,
): Promise<StudentBadge[]> {
  const awards: StudentBadge[] = [];
  let page = 1;

  while (true) {
    const response = await apiClient.get<Envelope<StudentBadge[]>>(
      '/studentBadge',
      {
        params: {
          studentId,
          academicTermId,
          page,
          limit: PAGE_SIZE,
        },
      },
    );

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || 'Failed to load badge awards');
    }

    const batch = Array.isArray(body.data) ? body.data : [];
    awards.push(...batch);

    const total = body.pagination?.total;
    if (total !== undefined ? awards.length >= total : batch.length < PAGE_SIZE) {
      break;
    }
    if (batch.length === 0) break;

    page += 1;
    if (page > 1000) break;
  }

  return awards;
}

export function useStudentBadgesForTerm(
  studentId?: string,
  academicTermId?: string,
) {
  const enabled = Boolean(studentId && academicTermId);
  const query = useQuery<StudentBadge[]>({
    queryKey: badgesKeys.studentAwards({
      studentId: studentId ?? '',
      academicTermId: academicTermId ?? '',
    }),
    queryFn: () =>
      fetchAllStudentBadges(studentId as string, academicTermId as string),
    enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnReconnect: true,
    meta: { persist: false },
  });

  const awards = useMemo(() => {
    const items = query.data ?? [];
    return [...items].sort((a, b) =>
      (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    );
  }, [query.data]);

  return {
    awards,
    isLoading: enabled && query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBadgeAwardMutations() {
  const queryClient = useQueryClient();
  const { post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const invalidateBadgeData = () => {
    void invalidateBadgeQueries(queryClient);
  };

  const awardBadge = async (payload: AwardBadgeInput) => {
    const result = await post({
      url: '/studentBadge',
      body: payload,
      toast: false,
    });
    invalidateBadgeData();
    return result;
  };

  const updateAwardNote = async (id: string, note: string | null) => {
    const result = await put({
      url: `/studentBadge/${id}`,
      body: { note },
      toast: false,
    });
    invalidateBadgeData();
    return result;
  };

  const revokeBadge = async (id: string) => {
    const result = await del({
      url: `/studentBadge/${id}`,
      toast: false,
    });
    invalidateBadgeData();
    return result;
  };

  return {
    awardBadge,
    updateAwardNote,
    revokeBadge,
    isAwarding: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isRevoking: deleteMutation.isPending,
  };
}
